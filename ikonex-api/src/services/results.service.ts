import { PrismaClient } from '@prisma/client';
import { getGrade } from '../utils/grading';

const prisma = new PrismaClient();

export interface StudentResult {
  studentId: string;
  studentName: string;
  admissionNo: string;
  subjects: SubjectResult[];
  totalMarks: number;
  averageScore: number;
  totalPoints: number;
  meanPoints: number;
  meanGrade: string;
  position: number;
}

export interface SubjectResult {
  subjectId: string;
  subjectName: string;
  score: number;
  grade: string;
  points: number;
  position: number;
}

export interface StudentReportCard {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    admissionNo: string;
    streamName: string;
    academicYear: string;
  };
  report: StudentResult & {
    term: string;
    academicYear: string;
    totalStudents: number;
    generatedAt: string;
  };
}

export interface ClassPerformanceReport {
  stream: {
    id: string;
    name: string;
    academicYear: string;
  };
  term: string;
  academicYear: string;
  generatedAt: string;
  totalStudents: number;
  topPerformer: Pick<StudentResult, 'studentId' | 'studentName' | 'averageScore' | 'meanGrade' | 'position'> | null;
  subjectPerformance: Array<{
    subjectId: string;
    subjectName: string;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
  }>;
  results: StudentResult[];
}

const getConfiguredScale = async () => {
  const scaleRows = await prisma.gradingScale.findMany({
    orderBy: { minScore: 'desc' },
  });

  if (scaleRows.length === 0) {
    return undefined;
  }

  return scaleRows.map(scale => ({
    min: scale.minScore,
    max: scale.maxScore,
    grade: scale.grade,
    points: scale.points,
    remarks: scale.remarks,
  }));
};

export const processStreamResults = async (
  streamId: string,
  term: string,
  academicYear: string
): Promise<StudentResult[]> => {
  const gradingScale = await getConfiguredScale();

  // Get all students in the stream
  const students = await prisma.student.findMany({
    where: { streamId, isActive: true },
    include: {
      scores: {
        where: {
          assessment: {
            streamId,
            term,
            academicYear,
          },
        },
        include: {
          assessment: {
            include: { subject: { select: { id: true, name: true } } },
          },
        },
      },
    },
    orderBy: { lastName: 'asc' },
  });

  // Group scores by student and subject, calculating weighted average
  const studentResults: Omit<StudentResult, 'position'>[] = students.map(student => {
    const subjectScores = new Map<string, { total: number; weights: number; name: string }>();

    for (const score of student.scores) {
      const { assessment } = score;
      if (!assessment) continue;
      const { id: subjectId, name: subjectName } = assessment.subject;
      const pct = (score.marks / assessment.maxMarks) * 100;

      if (!subjectScores.has(subjectId)) {
        subjectScores.set(subjectId, { total: 0, weights: 0, name: subjectName });
      }
      const entry = subjectScores.get(subjectId)!;
      entry.total += pct * assessment.weight;
      entry.weights += assessment.weight;
    }

    const subjects: Omit<SubjectResult, 'position'>[] = [];
    let totalPoints = 0;

    subjectScores.forEach((val, subjectId) => {
      const avgScore = val.weights > 0 ? val.total / val.weights : 0;
      const { grade, points } = getGrade(avgScore, gradingScale);
      subjects.push({ subjectId, subjectName: val.name, score: avgScore, grade, points });
      totalPoints += points;
    });

    const totalMarks = subjects.reduce((acc, s) => acc + s.score, 0);
    const averageScore = subjects.length > 0 ? totalMarks / subjects.length : 0;
    const meanPoints = subjects.length > 0 ? totalPoints / subjects.length : 0;
    const meanGrade = getGrade(averageScore, gradingScale).grade;

    return {
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      admissionNo: student.admissionNo,
      subjects: subjects as SubjectResult[],
      totalMarks,
      averageScore,
      totalPoints,
      meanPoints,
      meanGrade,
    };
  });

  // Rank students (handle ties)
  const sorted = [...studentResults].sort((a, b) => b.averageScore - a.averageScore);
  const withPositions: StudentResult[] = [];
  let position = 1;

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    if (!current) continue;

    const previous = i > 0 ? sorted[i - 1] : undefined;
    const previousRanked = i > 0 ? withPositions[i - 1] : undefined;

    if (previous && previousRanked && current.averageScore === previous.averageScore) {
      withPositions.push({ ...current, position: previousRanked.position, subjects: [] });
    } else {
      withPositions.push({ ...current, position, subjects: [] });
    }
    position++;
  }

  // Assign subject positions per subject
  const subjectPositions = new Map<string, { studentId: string; score: number }[]>();
  for (const student of studentResults) {
    for (const sub of student.subjects) {
      if (!subjectPositions.has(sub.subjectId)) subjectPositions.set(sub.subjectId, []);
      subjectPositions.get(sub.subjectId)!.push({ studentId: student.studentId, score: sub.score });
    }
  }

  subjectPositions.forEach((entries, _subjectId) => {
    entries.sort((a, b) => b.score - a.score);
  });

  // Build final with all positions
  return withPositions.map((sr, idx) => {
    const original = sorted[idx];
    if (!original) {
      return { ...sr, subjects: [] };
    }

    const subjects: SubjectResult[] = original.subjects.map(sub => {
      const posArr = subjectPositions.get(sub.subjectId) || [];
      const pos = posArr.findIndex(e => e.studentId === sr.studentId) + 1;
      return { ...sub, position: pos };
    });
    return { ...sr, subjects };
  });
};

export const generateStudentReportCard = async (
  studentId: string,
  term: string,
  academicYear: string
): Promise<StudentReportCard | null> => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      classStream: true,
    },
  });

  if (!student) {
    return null;
  }

  const results = await processStreamResults(student.streamId, term, academicYear);
  const report = results.find(result => result.studentId === studentId);

  if (!report) {
    return null;
  }

  await prisma.reportCard.upsert({
    where: {
      studentId_term_academicYear: {
        studentId,
        term,
        academicYear,
      },
    },
    update: {
      totalMarks: report.totalMarks,
      averageScore: report.averageScore,
      grade: report.meanGrade,
      position: report.position,
      totalStudents: results.length,
    },
    create: {
      studentId,
      term,
      academicYear,
      totalMarks: report.totalMarks,
      averageScore: report.averageScore,
      grade: report.meanGrade,
      position: report.position,
      totalStudents: results.length,
    },
  });

  return {
    student: {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      admissionNo: student.admissionNo,
      streamName: student.classStream.name,
      academicYear: student.classStream.academicYear,
    },
    report: {
      ...report,
      term,
      academicYear,
      totalStudents: results.length,
      generatedAt: new Date().toISOString(),
    },
  };
};

export const generateClassPerformanceReport = async (
  streamId: string,
  term: string,
  academicYear: string
): Promise<ClassPerformanceReport | null> => {
  const stream = await prisma.classStream.findUnique({
    where: { id: streamId },
  });

  if (!stream) {
    return null;
  }

  const results = await processStreamResults(streamId, term, academicYear);
  const subjectMap = new Map<string, { subjectName: string; scores: number[] }>();

  for (const result of results) {
    for (const subject of result.subjects) {
      const existing = subjectMap.get(subject.subjectId);
      if (existing) {
        existing.scores.push(subject.score);
      } else {
        subjectMap.set(subject.subjectId, {
          subjectName: subject.subjectName,
          scores: [subject.score],
        });
      }
    }
  }

  const subjectPerformance = Array.from(subjectMap.entries())
    .map(([subjectId, details]) => {
      const total = details.scores.reduce((sum, score) => sum + score, 0);
      return {
        subjectId,
        subjectName: details.subjectName,
        averageScore: details.scores.length ? total / details.scores.length : 0,
        highestScore: details.scores.length ? Math.max(...details.scores) : 0,
        lowestScore: details.scores.length ? Math.min(...details.scores) : 0,
      };
    })
    .sort((a, b) => b.averageScore - a.averageScore);

  const [topPerformer] = results;

  return {
    stream: {
      id: stream.id,
      name: stream.name,
      academicYear: stream.academicYear,
    },
    term,
    academicYear,
    generatedAt: new Date().toISOString(),
    totalStudents: results.length,
    topPerformer: topPerformer
      ? {
          studentId: topPerformer.studentId,
          studentName: topPerformer.studentName,
          averageScore: topPerformer.averageScore,
          meanGrade: topPerformer.meanGrade,
          position: topPerformer.position,
        }
      : null,
    subjectPerformance,
    results,
  };
};

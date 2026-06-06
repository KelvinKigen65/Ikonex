import { PrismaClient } from '@prisma/client';
import { getGrade, getMeanGrade } from '../utils/grading';

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

interface SubjectResult {
  subjectId: string;
  subjectName: string;
  score: number;
  grade: string;
  points: number;
  position: number;
}

export const processStreamResults = async (
  streamId: string,
  term: string,
  academicYear: string
): Promise<StudentResult[]> => {
  // Get all students in the stream
  const students = await prisma.student.findMany({
    where: { streamId, isActive: true },
    include: {
      scores: {
        include: {
          assessment: {
            where: { streamId, term, academicYear },
            include: { subject: { select: { id: true, name: true } } },
          },
        },
      },
    },
    orderBy: { lastName: 'asc' },
  });

  // Get all subjects for this stream
  const classSubjects = await prisma.classSubject.findMany({
    where: { streamId },
    include: { subject: true },
  });

  // Group scores by student and subject, calculating weighted average
  const studentResults: Omit<StudentResult, 'position'>[] = students.map(student => {
    const subjectScores = new Map<string, { total: number; weights: number; name: string }>();

    for (const score of student.scores) {
      const { assessment } = score;
      if (!assessment) continue;
      const { subjectId, name: subjectName } = assessment.subject;
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
      const { grade, points } = getGrade(avgScore);
      subjects.push({ subjectId, subjectName: val.name, score: avgScore, grade, points });
      totalPoints += points;
    });

    const totalMarks = subjects.reduce((acc, s) => acc + s.score, 0);
    const averageScore = subjects.length > 0 ? totalMarks / subjects.length : 0;
    const meanPoints = subjects.length > 0 ? totalPoints / subjects.length : 0;

    return {
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      admissionNo: student.admissionNo,
      subjects: subjects as SubjectResult[],
      totalMarks,
      averageScore,
      totalPoints,
      meanPoints,
      meanGrade: getMeanGrade(meanPoints),
    };
  });

  // Rank students (handle ties)
  const sorted = [...studentResults].sort((a, b) => b.averageScore - a.averageScore);
  const withPositions: StudentResult[] = [];
  let position = 1;

  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i].averageScore === sorted[i - 1].averageScore) {
      withPositions.push({ ...sorted[i], position: withPositions[i - 1].position, subjects: [] });
    } else {
      withPositions.push({ ...sorted[i], position, subjects: [] });
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
    const subjects: SubjectResult[] = original.subjects.map(sub => {
      const posArr = subjectPositions.get(sub.subjectId) || [];
      const pos = posArr.findIndex(e => e.studentId === sr.studentId) + 1;
      return { ...sub, position: pos };
    });
    return { ...sr, subjects };
  });
};
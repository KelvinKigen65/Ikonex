export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT';
export type Gender = 'MALE' | 'FEMALE';
export type AssessmentType = 'CAT1' | 'CAT2' | 'ASSIGNMENT' | 'MIDTERM' | 'END_TERM';
export type SubjectStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive?: boolean;
  createdAt: string;
}

export interface ClassStream {
  id: string;
  name: string;
  academicYear: string;
  teacherId: string;
  classTeacher: { id: string; firstName: string; lastName: string };
  createdAt: string;
  _count?: { students: number; classSubjects: number };
}

export interface Student {
  id: string;
  admissionNo: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  dateOfBirth: string;
  parentName: string;
  parentContact: string;
  email?: string;
  address?: string;
  photoUrl?: string;
  streamId: string;
  classStream: { id: string; name: string };
  isActive: boolean;
  createdAt: string;
}

export interface StudentPerformanceScore {
  id: string;
  marks: number;
  remarks?: string;
  createdAt: string;
  assessment: {
    id: string;
    name: string;
    type: AssessmentType;
    term: string;
    academicYear: string;
    maxMarks: number;
    subject: {
      id: string;
      name: string;
      code: string;
    };
  };
}

export interface StudentReportSummary {
  id: string;
  term: string;
  academicYear: string;
  totalMarks: number;
  averageScore: number;
  grade: string;
  position: number;
  totalStudents: number;
  generatedAt: string;
}

export interface StudentDetailRecord extends Student {
  scores: StudentPerformanceScore[];
  reportCards: StudentReportSummary[];
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  description?: string;
  status: SubjectStatus;
  teacherId?: string;
  teacher?: { id: string; firstName: string; lastName: string };
}

export interface Assessment {
  id: string;
  name: string;
  type: AssessmentType;
  maxMarks: number;
  weight: number;
  term: string;
  academicYear: string;
  subjectId: string;
  streamId?: string;
  subject: { id: string; name: string; code: string };
  _count?: { scores: number };
}

export interface Score {
  id: string;
  marks: number;
  remarks?: string;
  studentId: string;
  assessmentId: string;
  student: { id: string; admissionNo: string; firstName: string; lastName: string };
}

export interface SubjectResult {
  subjectId: string;
  subjectName: string;
  score: number;
  grade: string;
  points: number;
  position: number;
}

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
  topPerformer: {
    studentId: string;
    studentName: string;
    averageScore: number;
    meanGrade: string;
    position: number;
  } | null;
  subjectPerformance: Array<{
    subjectId: string;
    subjectName: string;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
  }>;
  results: StudentResult[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}

export interface DashboardStats {
  stats: { totalStudents: number; totalStreams: number; totalSubjects: number };
  subjectPerformance: { name: string; average: number; count: number }[];
  recentActivity: any[];
}

export interface GradingScale {
  id: string;
  grade: string;
  minScore: number;
  maxScore: number;
  points: number;
  remarks: string;
}

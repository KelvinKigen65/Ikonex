export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER';
export type Gender = 'MALE' | 'FEMALE';
export type AssessmentType = 'CAT1' | 'CAT2' | 'ASSIGNMENT' | 'MIDTERM' | 'END_TERM';
export type SubjectStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
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
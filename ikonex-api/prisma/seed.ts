import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create super admin
  const adminPass = await bcrypt.hash('Admin@1234', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ikonex.ac.ke' },
    update: {},
    create: {
      email: 'admin@ikonex.ac.ke',
      password: adminPass,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
    },
  });

  // Create teacher
  const teacherPass = await bcrypt.hash('Teacher@1234', 12);
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@ikonex.ac.ke' },
    update: {},
    create: {
      email: 'teacher@ikonex.ac.ke',
      password: teacherPass,
      firstName: 'Jane',
      lastName: 'Mwangi',
      role: 'TEACHER',
    },
  });

  // Create grading scale
  const gradingData = [
    { grade: 'A',  minScore: 80, maxScore: 100, points: 12, remarks: 'Excellent' },
    { grade: 'A-', minScore: 75, maxScore: 79,  points: 11, remarks: 'Excellent' },
    { grade: 'B+', minScore: 70, maxScore: 74,  points: 10, remarks: 'Very Good' },
    { grade: 'B',  minScore: 65, maxScore: 69,  points: 9,  remarks: 'Good' },
    { grade: 'B-', minScore: 60, maxScore: 64,  points: 8,  remarks: 'Good' },
    { grade: 'C+', minScore: 55, maxScore: 59,  points: 7,  remarks: 'Average' },
    { grade: 'C',  minScore: 50, maxScore: 54,  points: 6,  remarks: 'Average' },
    { grade: 'C-', minScore: 45, maxScore: 49,  points: 5,  remarks: 'Below Average' },
    { grade: 'D+', minScore: 40, maxScore: 44,  points: 4,  remarks: 'Below Average' },
    { grade: 'D',  minScore: 35, maxScore: 39,  points: 3,  remarks: 'Poor' },
    { grade: 'E',  minScore: 0,  maxScore: 34,  points: 2,  remarks: 'Fail' },
  ];
  for (const g of gradingData) {
    await prisma.gradingScale.upsert({
      where: { id: g.grade },
      update: {},
      create: { id: g.grade, ...g },
    });
  }

  // Create subjects
  const subjectData = [
    { code: 'MAT', name: 'Mathematics' },
    { code: 'ENG', name: 'English' },
    { code: 'KIS', name: 'Kiswahili' },
    { code: 'PHY', name: 'Physics' },
    { code: 'CHE', name: 'Chemistry' },
    { code: 'BIO', name: 'Biology' },
    { code: 'HIS', name: 'History' },
    { code: 'GEO', name: 'Geography' },
    { code: 'CRE', name: 'CRE' },
    { code: 'BST', name: 'Business Studies' },
  ];
  const subjects: Record<string, any> = {};
  for (const s of subjectData) {
    subjects[s.code] = await prisma.subject.upsert({
      where: { code: s.code },
      update: {},
      create: { ...s, teacherId: teacher.id },
    });
  }

  // Create class streams
  const streamData = [
    { name: 'Form 1A', academicYear: '2024' },
    { name: 'Form 1B', academicYear: '2024' },
    { name: 'Form 2A', academicYear: '2024' },
    { name: 'Form 2B', academicYear: '2024' },
    { name: 'Form 3A', academicYear: '2024' },
    { name: 'Form 4A', academicYear: '2024' },
  ];
  const streams: Record<string, any> = {};
  for (const s of streamData) {
    streams[s.name] = await prisma.classStream.upsert({
      where: { name: s.name },
      update: {},
      create: { ...s, teacherId: teacher.id },
    });
  }

  // Assign core subjects to Form 1A
  const coreSubjects = ['MAT', 'ENG', 'KIS', 'BIO', 'CHE'];
  for (const code of coreSubjects) {
    await prisma.classSubject.upsert({
      where: { streamId_subjectId: { streamId: streams['Form 1A'].id, subjectId: subjects[code].id } },
      update: {},
      create: { streamId: streams['Form 1A'].id, subjectId: subjects[code].id },
    });
  }

  // Create sample students in Form 1A
  const studentData = [
    { admissionNo: 'ADM001', firstName: 'Alice', lastName: 'Kamau', gender: 'FEMALE', dateOfBirth: new Date('2010-03-15'), parentName: 'John Kamau', parentContact: '0712345678' },
    { admissionNo: 'ADM002', firstName: 'Brian', lastName: 'Ochieng', gender: 'MALE', dateOfBirth: new Date('2010-07-22'), parentName: 'Peter Ochieng', parentContact: '0723456789' },
    { admissionNo: 'ADM003', firstName: 'Carol', lastName: 'Wanjiku', gender: 'FEMALE', dateOfBirth: new Date('2010-11-05'), parentName: 'James Wanjiku', parentContact: '0734567890' },
    { admissionNo: 'ADM004', firstName: 'David', lastName: 'Mutua', gender: 'MALE', dateOfBirth: new Date('2010-01-30'), parentName: 'Simon Mutua', parentContact: '0745678901' },
    { admissionNo: 'ADM005', firstName: 'Eve', lastName: 'Achieng', gender: 'FEMALE', dateOfBirth: new Date('2010-06-18'), parentName: 'Mary Achieng', parentContact: '0756789012' },
  ];
  for (const s of studentData) {
    await prisma.student.upsert({
      where: { admissionNo: s.admissionNo },
      update: {},
      create: { ...s, streamId: streams['Form 1A'].id } as any,
    });
  }

  console.log('✅ Seed complete!');
  console.log('👤 Admin: admin@ikonex.ac.ke / Admin@1234');
  console.log('👤 Teacher: teacher@ikonex.ac.ke / Teacher@1234');
}

main().catch(console.error).finally(() => prisma.$disconnect());
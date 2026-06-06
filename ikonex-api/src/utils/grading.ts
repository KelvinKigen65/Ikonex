export interface GradeResult {
  grade: string;
  points: number;
  remarks: string;
}

const DEFAULT_SCALE = [
  { min: 80, max: 100, grade: 'A',  points: 12, remarks: 'Excellent' },
  { min: 75, max: 79,  grade: 'A-', points: 11, remarks: 'Excellent' },
  { min: 70, max: 74,  grade: 'B+', points: 10, remarks: 'Very Good' },
  { min: 65, max: 69,  grade: 'B',  points: 9,  remarks: 'Good' },
  { min: 60, max: 64,  grade: 'B-', points: 8,  remarks: 'Good' },
  { min: 55, max: 59,  grade: 'C+', points: 7,  remarks: 'Average' },
  { min: 50, max: 54,  grade: 'C',  points: 6,  remarks: 'Average' },
  { min: 45, max: 49,  grade: 'C-', points: 5,  remarks: 'Below Average' },
  { min: 40, max: 44,  grade: 'D+', points: 4,  remarks: 'Below Average' },
  { min: 35, max: 39,  grade: 'D',  points: 3,  remarks: 'Poor' },
  { min: 0,  max: 34,  grade: 'E',  points: 2,  remarks: 'Fail' },
];

export const getGrade = (score: number, scale = DEFAULT_SCALE): GradeResult => {
  const entry = scale.find(s => score >= s.min && score <= s.max);
  return entry
    ? { grade: entry.grade, points: entry.points, remarks: entry.remarks }
    : { grade: 'E', points: 2, remarks: 'Fail' };
};

export const getMeanGrade = (points: number): string => {
  if (points >= 11) return 'A';
  if (points >= 10) return 'A-';
  if (points >= 9)  return 'B+';
  if (points >= 8)  return 'B';
  if (points >= 7)  return 'B-';
  if (points >= 6)  return 'C+';
  if (points >= 5)  return 'C';
  if (points >= 4)  return 'C-';
  if (points >= 3)  return 'D+';
  if (points >= 2)  return 'D';
  return 'E';
};
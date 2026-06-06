import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { processStreamResults } from '../services/results.service';

const prisma = new PrismaClient();

export const getResults = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { streamId, term, academicYear } = req.query;
    if (!streamId || !term || !academicYear)
      return res.status(400).json({ error: 'streamId, term, and academicYear are required' });

    const results = await processStreamResults(
      String(streamId), String(term), String(academicYear)
    );
    res.json({ results });
  } catch (err) { next(err); }
};

export const getDashboardStats = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [totalStudents, totalStreams, totalSubjects, recentScores] = await Promise.all([
      prisma.student.count({ where: { isActive: true } }),
      prisma.classStream.count(),
      prisma.subject.count({ where: { status: 'ACTIVE' } }),
      prisma.score.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          student: { select: { firstName: true, lastName: true } },
          assessment: { include: { subject: { select: { name: true } } } },
        },
      }),
    ]);

    // Subject performance averages
    const subjectPerf = await prisma.subject.findMany({
      where: { status: 'ACTIVE' },
      include: {
        assessments: {
          include: { scores: { select: { marks: true } } },
        },
      },
    });

    const subjectData = subjectPerf.map(subj => {
      const allScores: number[] = [];
      for (const a of subj.assessments) {
        for (const s of a.scores) {
          allScores.push((s.marks / (a.maxMarks || 100)) * 100);
        }
      }
      const avg = allScores.length > 0
        ? allScores.reduce((a, b) => a + b, 0) / allScores.length
        : 0;
      return { name: subj.name, average: Math.round(avg * 10) / 10, count: allScores.length };
    }).filter(s => s.count > 0);

    res.json({
      stats: { totalStudents, totalStreams, totalSubjects },
      subjectPerformance: subjectData,
      recentActivity: recentScores,
    });
  } catch (err) { next(err); }
};
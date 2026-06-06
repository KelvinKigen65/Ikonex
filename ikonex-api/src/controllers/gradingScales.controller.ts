import { PrismaClient } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';

const prisma = new PrismaClient();
interface IncomingScale {
  id?: string;
  grade?: string;
  minScore?: number | string;
  maxScore?: number | string;
  points?: number | string;
  remarks?: string;
}

export const getGradingScales = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const gradingScales = await prisma.gradingScale.findMany({
      orderBy: { minScore: 'desc' },
    });

    res.json({ gradingScales });
  } catch (error) {
    next(error);
  }
};

export const updateGradingScales = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const gradingScales = Array.isArray(req.body?.gradingScales) ? req.body.gradingScales : null;

    if (!gradingScales || gradingScales.length === 0) {
      return res.status(400).json({ error: 'gradingScales is required' });
    }

    const normalized = (gradingScales as IncomingScale[])
      .map((scale) => ({
        id: String(scale.id ?? scale.grade),
        grade: String(scale.grade),
        minScore: Number(scale.minScore),
        maxScore: Number(scale.maxScore),
        points: Number(scale.points),
        remarks: String(scale.remarks ?? ''),
      }))
      .sort((a, b) => b.minScore - a.minScore);

    for (const scale of normalized) {
      if (Number.isNaN(scale.minScore) || Number.isNaN(scale.maxScore) || Number.isNaN(scale.points)) {
        return res.status(400).json({ error: 'All grading scale values must be numeric where expected' });
      }

      if (scale.minScore > scale.maxScore) {
        return res.status(400).json({ error: `Invalid range for ${scale.grade}` });
      }
    }

    await prisma.$transaction([
      prisma.gradingScale.deleteMany(),
      ...normalized.map((scale) =>
        prisma.gradingScale.create({
          data: scale,
        })
      ),
    ]);

    const updated = await prisma.gradingScale.findMany({
      orderBy: { minScore: 'desc' },
    });

    res.json({ gradingScales: updated });
  } catch (error) {
    next(error);
  }
};

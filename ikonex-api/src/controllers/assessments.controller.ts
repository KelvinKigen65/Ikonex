import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAssessments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { subjectId, streamId, term, academicYear } = req.query;
    const where: any = {};
    if (typeof subjectId === 'string') where.subjectId = subjectId;
    if (typeof streamId === 'string') where.streamId = streamId;
    if (typeof term === 'string') where.term = term;
    if (typeof academicYear === 'string') where.academicYear = academicYear;

    const assessments = await prisma.assessment.findMany({
      where,
      include: {
        subject: { select: { id: true, name: true, code: true } },
        _count: { select: { scores: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ assessments });
  } catch (err) { next(err); }
};

export const createAssessment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const assessment = await prisma.assessment.create({
      data: { ...req.body, createdById: userId },
      include: { subject: { select: { id: true, name: true } } },
    });
    res.status(201).json({ assessment });
  } catch (err) { next(err); }
};

export const updateAssessment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) return res.status(400).json({ error: 'Assessment id is required' });

    const assessment = await prisma.assessment.update({
      where: { id },
      data: req.body,
    });
    res.json({ assessment });
  } catch (err) { next(err); }
};

export const deleteAssessment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) return res.status(400).json({ error: 'Assessment id is required' });

    await prisma.assessment.delete({ where: { id } });
    res.json({ message: 'Assessment deleted' });
  } catch (err) { next(err); }
};

export const bulkSubmitScores = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { assessmentId, scores } = req.body;
    // scores: Array<{ studentId: string; marks: number; remarks?: string }>

    const assessment = await prisma.assessment.findUnique({ where: { id: assessmentId } });
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });

    // Validate marks don't exceed max
    const invalid = scores.filter((s: any) => s.marks > assessment.maxMarks || s.marks < 0);
    if (invalid.length > 0)
      return res.status(400).json({ error: `Marks must be between 0 and ${assessment.maxMarks}` });

    // Upsert scores
    const results = await prisma.$transaction(
      scores.map((score: any) =>
        prisma.score.upsert({
          where: { studentId_assessmentId: { studentId: score.studentId, assessmentId } },
          create: { studentId: score.studentId, assessmentId, marks: score.marks, remarks: score.remarks },
          update: { marks: score.marks, remarks: score.remarks },
        })
      )
    );

    res.json({ saved: results.length, message: `${results.length} scores saved` });
  } catch (err) { next(err); }
};

export const getScores = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assessmentId = Array.isArray(req.params.assessmentId)
      ? req.params.assessmentId[0]
      : req.params.assessmentId;
    if (!assessmentId) return res.status(400).json({ error: 'Assessment id is required' });

    const scores = await prisma.score.findMany({
      where: { assessmentId },
      include: {
        student: { select: { id: true, admissionNo: true, firstName: true, lastName: true } },
      },
      orderBy: { student: { lastName: 'asc' } },
    });
    res.json({ scores });
  } catch (err) { next(err); }
};

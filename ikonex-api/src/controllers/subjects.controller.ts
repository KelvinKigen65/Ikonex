import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getSubjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 50, search, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};
    if (status) where.status = String(status);
    if (search) where.OR = [
      { name: { contains: String(search), mode: 'insensitive' } },
      { code: { contains: String(search), mode: 'insensitive' } },
    ];

    const [subjects, total] = await Promise.all([
      prisma.subject.findMany({
        where, skip, take: Number(limit),
        include: { teacher: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { name: 'asc' },
      }),
      prisma.subject.count({ where }),
    ]);

    res.json({ subjects, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) { next(err); }
};

export const createSubject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subject = await prisma.subject.create({
      data: req.body,
      include: { teacher: { select: { id: true, firstName: true, lastName: true } } },
    });
    res.status(201).json({ subject });
  } catch (err) { next(err); }
};

export const updateSubject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subject = await prisma.subject.update({
      where: { id: req.params.id }, data: req.body,
      include: { teacher: { select: { id: true, firstName: true, lastName: true } } },
    });
    res.json({ subject });
  } catch (err) { next(err); }
};

export const deleteSubject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.subject.delete({ where: { id: req.params.id } });
    res.json({ message: 'Subject deleted' });
  } catch (err) { next(err); }
};

export const assignSubjectToStream = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { streamId, subjectId } = req.body;
    const assignment = await prisma.classSubject.create({ data: { streamId, subjectId } });
    res.status(201).json({ assignment });
  } catch (err) { next(err); }
};
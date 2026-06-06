import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getStudents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, search, streamId, gender } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { isActive: true };
    if (streamId) where.streamId = String(streamId);
    if (gender) where.gender = String(gender);
    if (search) {
      where.OR = [
        { firstName: { contains: String(search), mode: 'insensitive' } },
        { lastName: { contains: String(search), mode: 'insensitive' } },
        { admissionNo: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: Number(limit),
        include: { classStream: { select: { id: true, name: true } } },
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      }),
      prisma.student.count({ where }),
    ]);

    res.json({ students, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    next(err);
  }
};

export const getStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
      include: {
        classStream: true,
        scores: {
          include: { assessment: { include: { subject: true } } },
          orderBy: { createdAt: 'desc' },
        },
        reportCards: { orderBy: { generatedAt: 'desc' } },
      },
    });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json({ student });
  } catch (err) {
    next(err);
  }
};

export const createStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const student = await prisma.student.create({
      data: req.body,
      include: { classStream: { select: { id: true, name: true } } },
    });
    res.status(201).json({ student });
  } catch (err) {
    next(err);
  }
};

export const updateStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const student = await prisma.student.update({
      where: { id: req.params.id },
      data: req.body,
      include: { classStream: { select: { id: true, name: true } } },
    });
    res.json({ student });
  } catch (err) {
    next(err);
  }
};

export const deleteStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.student.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });
    res.json({ message: 'Student deactivated successfully' });
  } catch (err) {
    next(err);
  }
};
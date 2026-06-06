import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getStreams = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const searchTerm = typeof search === 'string' ? search : undefined;

    const where = searchTerm
      ? { name: { contains: searchTerm, mode: 'insensitive' as const } }
      : {};

    const [streams, total] = await Promise.all([
      prisma.classStream.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          classTeacher: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { students: true, classSubjects: true } },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.classStream.count({ where }),
    ]);

    res.json({ streams, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    next(err);
  }
};

export const getStream = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) return res.status(400).json({ error: 'Stream id is required' });

    const stream = await prisma.classStream.findUnique({
      where: { id },
      include: {
        classTeacher: { select: { id: true, firstName: true, lastName: true, email: true } },
        students: { where: { isActive: true }, orderBy: { lastName: 'asc' } },
        classSubjects: { include: { subject: true } },
        _count: { select: { students: true } },
      },
    });
    if (!stream) return res.status(404).json({ error: 'Stream not found' });
    res.json({ stream });
  } catch (err) {
    next(err);
  }
};

export const createStream = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, academicYear, teacherId } = req.body;
    const stream = await prisma.classStream.create({
      data: { name, academicYear, teacherId },
      include: { classTeacher: { select: { id: true, firstName: true, lastName: true } } },
    });
    res.status(201).json({ stream });
  } catch (err) {
    next(err);
  }
};

export const updateStream = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) return res.status(400).json({ error: 'Stream id is required' });

    const stream = await prisma.classStream.update({
      where: { id },
      data: req.body,
      include: { classTeacher: { select: { id: true, firstName: true, lastName: true } } },
    });
    res.json({ stream });
  } catch (err) {
    next(err);
  }
};

export const deleteStream = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) return res.status(400).json({ error: 'Stream id is required' });

    await prisma.classStream.delete({ where: { id } });
    res.json({ message: 'Stream deleted successfully' });
  } catch (err) {
    next(err);
  }
};

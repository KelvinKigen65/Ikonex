import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient, Role } from '@prisma/client';
import { signToken } from '../config/jwt';

const prisma = new PrismaClient();
const signupRoles: Role[] = [Role.ADMIN, Role.TEACHER];

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive)
      return res.status(401).json({ error: 'Invalid credentials' });

    if (user.role === Role.STUDENT) {
      return res.status(403).json({ error: 'Student login is not enabled' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken({ userId: user.id, role: user.role, email: user.email });

    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (err) {
    next(err);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;
    const normalizedRole = typeof role === 'string' ? role.toUpperCase() as Role : Role.TEACHER;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Email, password, first name, and last name are required' });
    }

    if (!signupRoles.includes(normalizedRole)) {
      return res.status(400).json({ error: 'Invalid signup role' });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists)
      return res.status(409).json({ error: 'Email already exists' });

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hashed, firstName, lastName, role: normalizedRole },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, createdAt: true },
    });
    const token = signToken({ userId: user.id, role: user.role, email: user.email });

    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: (req as any).user.userId },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true },
    });
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = (req as any).user.userId;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ error: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } });

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};

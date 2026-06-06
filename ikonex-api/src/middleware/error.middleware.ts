import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(err);

  if (err.code === 'P2002')
    return res.status(409).json({ error: 'Record already exists' });
  if (err.code === 'P2025')
    return res.status(404).json({ error: 'Record not found' });

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
};
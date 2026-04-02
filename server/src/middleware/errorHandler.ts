import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  console.error(`[Error] ${err.message}`);
  const status = (err as any).status || 400;
  res.status(status).json({ error: err.message });
}

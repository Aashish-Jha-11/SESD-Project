import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  const status = (err as any).status || 500;
  const isServerError = status >= 500;

  if (isServerError) {
    console.error(`[Error] ${req.method} ${req.originalUrl} -> ${status}: ${err.message}`);
    if (err.stack) {
      console.error(err.stack);
    }
  } else {
    console.warn(`[Warn] ${req.method} ${req.originalUrl} -> ${status}: ${err.message}`);
  }

  const body: { error: string; stack?: string } = { error: err.message };
  if (isServerError && process.env.NODE_ENV !== 'production' && err.stack) {
    body.stack = err.stack;
  }

  res.status(status).json(body);
}

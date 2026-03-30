import { Request, Response, NextFunction } from 'express';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // json
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ status: 400, message: 'Invalid JSON', isError: true });
  }

  // base
  let status = err.status || 500;
  let message = err.message || 'Server error';

  // mongo
  if (err.name === 'ValidationError') status = 400;
  if (err.code === 11000) {
    status = 400;
    message = 'Duplicate value';
  }

  // response
  return res.status(status).json({ status, message, isError: true });
};

export default errorHandler;

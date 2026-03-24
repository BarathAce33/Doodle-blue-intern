import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// user req
export interface AuthRequest extends Request {
  user?: number;
}

export const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  // header
  const authHeader = req.header('Authorization');

  // check
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: 401, message: 'No token' });
  }

  // extract
  const parts = authHeader.split(' ');
  if (parts.length !== 2) {
    return res.status(401).json({ status: 401, message: 'Bad format' });
  }

  const token = parts[1];

  // verify
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: number };
    req.user = decoded.id; 
    next();
  } catch (err) {
    return res.status(401).json({ status: 401, message: 'Bad token' });
  }
};

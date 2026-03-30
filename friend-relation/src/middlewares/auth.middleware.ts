import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// auth
export const auth = (req: Request | any, res: Response, next: NextFunction) => {
  const authHeader = req.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: 401, message: 'No token provided' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2) {
    return res.status(401).json({ status: 401, message: 'Token format is invalid' });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    req.user = decoded.id; 
    next();
  } catch (err) {
    return res.status(401).json({ status: 401, message: 'Bad token' });
  }
};

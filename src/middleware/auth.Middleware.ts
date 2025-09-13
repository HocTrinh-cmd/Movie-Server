import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { users } from '../db/schema';
import { verifyAccessToken } from '../utils/jwt.utils';


interface AuthRequest extends Request {
  user?: { userId: string };
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = verifyAccessToken(token); 
    req.user = (decoded as { userId: string });
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
    return;
  }
};

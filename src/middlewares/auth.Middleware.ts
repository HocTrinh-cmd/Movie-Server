import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { users } from '../db/schema';
import { verifyAccessToken } from '../utils/jwt.utils';
import { ApiError } from '../utils/ApiError';


interface AuthRequest extends Request {
  user?: { userId: string };
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    throw new ApiError(401, 'No token provided');
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = (decoded as { userId: string });
    next();
  } catch (err) {
    throw new ApiError(401, 'Invalid token');
  }
};

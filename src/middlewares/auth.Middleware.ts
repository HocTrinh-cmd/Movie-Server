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

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    // Nếu không có token -> Là khách (Guest) -> Next luôn
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }

    const token = authHeader.split(' ')[1];

    try {
        // Nếu có token -> Thử giải mã
        const secret = process.env.JWT_SECRET as string;
        const decoded = jwt.verify(token, secret);
        
        // Gắn thông tin user vào request để Controller dùng
        (req as any).user = decoded; 
        
    } catch (error) {
        // Token lỗi hoặc hết hạn -> Vẫn coi là khách -> Next luôn
        console.log("Optional Auth: Token invalid, treating as guest.");
    }

    next();
};

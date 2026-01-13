import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

export const errorMiddleware = (
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Default code là 500 nếu không xác định được
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    // 👇 LOGIC QUAN TRỌNG: Format JSON trả về chuẩn 3 trường
    res.status(statusCode).json({
        status: 'error', // Hoặc 'fail' tùy bạn, nhưng giữ key là 'status'
        message: message,
        data: null, // Luôn trả về data là null khi có lỗi để client không bị undefined
    });
};
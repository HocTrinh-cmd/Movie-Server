import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

export const globalErrorHandler = (
    err: Error | ApiError,
    req: Request,
    res: Response,
    next: NextFunction // Bắt buộc phải có đủ 4 tham số express mới hiểu đây là error handler
) => {

    // 1. Mặc định là lỗi 500 (Server Error) nếu không xác định được
    let statusCode = 500;
    let message = 'Internal Server Error';

    // 2. Nếu là lỗi do mình chủ động ném (ApiError)
    if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;
    } else {
        // Nếu là lỗi lạ (code crash, db die...), log ra terminal để dev sửa
        console.error('ERROR 💥:', err);
    }

    // 3. Trả về client format thống nhất
    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
        // Chỉ hiện stack trace nếu không phải production (để debug)
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};
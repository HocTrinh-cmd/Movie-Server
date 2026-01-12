import { Request, Response, NextFunction, RequestHandler } from 'express';

// Hàm này nhận vào một controller và trả về một RequestHandler chuẩn của Express
export const asyncHandler = (fn: Function): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
        // Gọi hàm controller, nếu có lỗi (Promise reject) thì đẩy xuống next(error)
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
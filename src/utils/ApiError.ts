export class ApiError extends Error {
    statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        // Dòng này giúp stack trace hiện đúng tên class khi debug
        Error.captureStackTrace(this, this.constructor);
    }
}
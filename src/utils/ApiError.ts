export class ApiError extends Error {
    public statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        // Fix lỗi prototype chain trong TypeScript khi kế thừa Error
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}
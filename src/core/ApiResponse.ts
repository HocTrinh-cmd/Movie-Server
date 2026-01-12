import { Response } from 'express';

enum StatusCode {
  SUCCESS = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_ERROR = 500,
}

// Class trả về thành công
export class SuccessResponse<T> {
  constructor(
    private message: string,
    private data?: T,
    private statusCode: number = StatusCode.SUCCESS
  ) {}

  send(res: Response) {
    return res.status(this.statusCode).json({
      status: 'success',
      message: this.message,
      data: this.data,
    });
  }
}

// Class trả về thành công khi tạo mới (201)
export class CreatedResponse<T> extends SuccessResponse<T> {
  constructor(message: string, data?: T) {
    super(message, data, StatusCode.CREATED);
  }
}
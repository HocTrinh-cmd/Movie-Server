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
    private data?: T, // data có thể có hoặc không (undefined)
    private statusCode: number = StatusCode.SUCCESS
  ) {}

  send(res: Response) {
    return res.status(this.statusCode).json({
      status: 'success', // Cố định cứng theo yêu cầu
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

// CLASS PHÂN TRANG
export class PaginationResponse<T> extends SuccessResponse<{
  pagination: {
    page: number;
    perPage: number;
    totalRecords: number;
    totalPages: number;
  };
  records: T[];
}> {
  constructor(
    message: string,
    records: T[],
    page: number,
    perPage: number,
    totalRecords: number
  ) {
    // Tính toán số trang
    const totalPages = Math.ceil(totalRecords / perPage) || 1; // Ít nhất là 1 trang

    // Gọi cha (SuccessResponse) nhưng cấu trúc data bây giờ fix cứng là có pagination
    super(message, {
      pagination: {
        page: Number(page),
        perPage: Number(perPage),
        totalRecords: Number(totalRecords),
        totalPages: Number(totalPages),
      },
      records: records,
    });
  }
}
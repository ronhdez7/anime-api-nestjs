import { ApiExceptionResponse } from "src/errors/interfaces/errors.interface";

export type ApiResponse<T = any> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: ApiExceptionResponse;
    };

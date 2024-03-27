import { ApiExceptionResponse } from "src/errors/interfaces/errors.interface";

/**
 * Response format returned by api
 */
export type ApiResponse<T = any> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: ApiExceptionResponse;
    };

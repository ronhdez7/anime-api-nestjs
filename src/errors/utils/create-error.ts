import { ApiResponse } from "src/interfaces/api.interface";
import { ApiExceptionResponse } from "../interfaces/errors.interface";

/** Utils for creating error response */
export function createErrorResponseBody(
  body: ApiExceptionResponse,
): ApiResponse {
  return {
    success: false,
    error: body,
  };
}

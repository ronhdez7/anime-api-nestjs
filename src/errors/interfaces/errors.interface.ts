import { HttpStatus } from "@nestjs/common";

interface ApiExceptionDetails {
  cause?: unknown;
  description?: string;
}

export interface ApiExceptionInfo {
  message: string; // how to fix error
  statusCode: HttpStatus;
  details: ApiExceptionDetails;
}

export interface ApiExceptionResponse extends ApiExceptionInfo {
  timestamp: number;
  path: string;
}

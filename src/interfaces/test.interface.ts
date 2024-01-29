import { ApiExceptionResponse } from "src/errors/interfaces/errors.interface";
import supertest from "supertest";
import { ApiResponse } from "./api.interface";

export interface TestResponse<Body = any> extends supertest.Response {
  body: ApiResponse<Body>;
}

export interface TestSuccess<Body = any> extends supertest.Response {
  body: { success: true; data: Body };
}

export interface TestError extends supertest.Response {
  body: { success: false; error: ApiExceptionResponse };
}

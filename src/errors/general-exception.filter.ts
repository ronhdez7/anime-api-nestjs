import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { createErrorResponseBody } from "./utils/create-error";
import { AxiosError } from "axios";

@Catch()
export class ApiGeneralExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const httpStatusCode = HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = createErrorResponseBody({
      message: "An unexpected internal error happened. Please try again later.",
      statusCode: httpStatusCode,
      details: {
        cause:
          exception instanceof AxiosError
            ? exception.toJSON()
            : exception instanceof Error
              ? {
                  ...exception,
                  name: exception.name,
                  message: exception.message,
                  stack: undefined,
                }
              : exception,
        description: "An error happened on our side.",
      },
      timestamp: Date.now(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    });

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatusCode);
  }
}

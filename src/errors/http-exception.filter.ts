import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { createErrorResponseBody } from "./utils/create-error";
import { formatErrorCause } from "./utils/error-cause";

/** Catch any http errors thrown by NestJS */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const httpStatusCode = exception.getStatus();
    const errorRes = exception.getResponse();

    const responseBody = createErrorResponseBody({
      message:
        typeof errorRes === "string"
          ? errorRes
          : String((errorRes as any).message),
      statusCode: httpStatusCode,
      details: {
        cause: formatErrorCause(exception),
        description: (exception.cause as any) ?? undefined,
      },
      timestamp: Date.now(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    });

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatusCode);
  }
}

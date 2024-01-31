import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { ThrottlerException } from "@nestjs/throttler";
import { createErrorResponseBody } from "./utils/create-error";
import { formatErrorCause } from "./utils/error-cause";

@Catch(ThrottlerException)
export class ThrottlerExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: ThrottlerException, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const httpStatusCode = exception.getStatus();

    const responseBody = createErrorResponseBody({
      message: exception.message,
      statusCode: httpStatusCode,
      details: {
        description: "Please try again later.",
        cause: formatErrorCause(exception),
      },
      timestamp: Date.now(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    });

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatusCode);
  }
}

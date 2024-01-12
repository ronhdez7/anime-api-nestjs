import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { ApiException } from "src/errors/http.exception";
import { createErrorResponseBody } from "./utils/create-error";

@Catch(ApiException)
export class ApiExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: ApiException, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const httpStatusCode = exception.getStatus();
    const errorRes = exception.getResponse();

    const responseBody = createErrorResponseBody({
      ...errorRes,
      timestamp: Date.now(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    });

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatusCode);
  }
}

import { HttpException } from "@nestjs/common";
import { ApiExceptionInfo } from "./interfaces/errors.interface";

export class ApiException extends HttpException {
  constructor(
    message: ApiExceptionInfo["message"],
    statusCode: ApiExceptionInfo["statusCode"],
    details?: ApiExceptionInfo["details"],
  ) {
    super(
      {
        message,
        statusCode,
        details: details ?? {},
      },
      statusCode,
      details,
    );
  }

  override getResponse(): ApiExceptionInfo {
    return super.getResponse() as ApiExceptionInfo;
  }
}

// throw new HttpError("Please provide correct url", HttpStatus.BAD_REQUEST, {
//   cause: Error,
//   description: "Invalid url",
// });

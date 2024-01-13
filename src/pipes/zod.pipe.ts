import {
  ArgumentMetadata,
  HttpStatus,
  Injectable,
  PipeTransform,
} from "@nestjs/common";
import { ApiException } from "src/errors/http.exception";
import { ZodError, ZodType, z } from "zod";

@Injectable()
export class ZodPipe<T extends ZodType, R = z.infer<T>>
  implements PipeTransform<T, R>
{
  constructor(private readonly schema: T) {}

  transform(value: any, metadata: ArgumentMetadata) {
    try {
      value = this.schema.parse(value);
    } catch (err) {
      // Create message
      let message: string = "Error validating request params";
      if (metadata.type !== "custom") {
        const paramType = metadata.type !== "param" ? metadata.type : "path";
        if (metadata.data) {
          message = `${paramType} param "${metadata.data}" is invalid`;
        } else {
          message = `${paramType} is invalid`;
        }
      } else {
        if (metadata.data) {
          message = `Property ${metadata.data} is invalid`;
        }
      }
      message = message.charAt(0).toUpperCase() + message.slice(1);

      // Create validation error
      let description: string;
      if (err instanceof ZodError) {
        description = err.issues.reduce((prev, issue) => {
          return `${prev}${issue.message};`;
        }, "");
      } else description = "Unknown validation error";

      throw new ApiException(message, HttpStatus.BAD_REQUEST, {
        cause: err,
        description,
      });
    }

    return value;
  }
}

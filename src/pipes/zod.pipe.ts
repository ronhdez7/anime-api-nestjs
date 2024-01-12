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
      if (err instanceof ZodError) {
        // Create message
        let message: string = "";
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

        throw new ApiException(message, HttpStatus.BAD_REQUEST, {
          cause: err,
          description: err.issues.reduce((prev, issue) => {
            return `${prev}${issue.message};`;
          }, ""),
        });
      } else throw err;
    }

    return value;
  }
}

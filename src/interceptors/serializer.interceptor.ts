import {
  CallHandler,
  ExecutionContext,
  HttpRedirectResponse,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, map } from "rxjs";
import { ApiResponse } from "src/interfaces/api.interface";
import { Redirection } from "src/utils/http-redirection";

/** Formats api response */
@Injectable()
export class SerializeInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse | HttpRedirectResponse> {
    // handle returned value
    return next.handle().pipe(
      map((data) => {
        // if data is a redirection, just return the response
        if (data instanceof Redirection) return data.getResponse();

        return {
          success: true,
          data,
        };
      }),
    );
  }
}

import { CacheInterceptor } from "@nestjs/cache-manager";
import { ExecutionContext } from "@nestjs/common";
import { Request } from "express";

/** Controls cache behavior */
export class CacheControlInterceptor extends CacheInterceptor {
  protected isRequestCacheable(context: ExecutionContext): boolean {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();

    /** Disables cache depending on header */
    const cacheControl = request.header("Cache-Control");
    if (cacheControl === "no-cache" || cacheControl === "no-store") {
      return false;
    }

    return true;
  }
}

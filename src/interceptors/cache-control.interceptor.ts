import { CacheInterceptor } from "@nestjs/cache-manager";
import { ExecutionContext } from "@nestjs/common";
import { Request } from "express";

export class CacheControlInterceptor extends CacheInterceptor {
  protected isRequestCacheable(context: ExecutionContext): boolean {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();

    const cacheControl = request.header("Cache-Control");
    if (cacheControl === "no-cache" || cacheControl === "no-store") {
      return false;
    }

    return true;
  }
}

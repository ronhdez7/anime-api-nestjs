import { Module } from "@nestjs/common";
import { AnimeModule } from "./anime/anime.module";
import { NineAnimeService } from "./anime/providers/9anime/9anime.service";
import { NineAnimeModule } from "./anime/providers/9anime/9anime.module";
import { GogoanimeModule } from "./anime/providers/gogoanime/gogoanime.module";
import { AnicrushModule } from "./anime/providers/anicrush/anicrush.module";
import { AppController } from "./app.controller";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ApiExceptionFilter } from "./errors/exception.filter";
import { ApiGeneralExceptionFilter } from "./errors/general-exception.filter";
import { SerializeInterceptor } from "./interceptors/serializer.interceptor";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { ThrottlerExceptionFilter } from "./errors/throttler-exception.filter";
import { CacheModule } from "@nestjs/cache-manager";
import { CacheControlInterceptor } from "./interceptors/cache-control.interceptor";

@Module({
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ApiGeneralExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ThrottlerExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ApiExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SerializeInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheControlInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60 * 1000,
        limit: 90,
      },
    ]),
    CacheModule.register({
      ttl: 60 * 1000,
    }),
    AnimeModule.register(NineAnimeService),
    NineAnimeModule,
    GogoanimeModule,
    AnicrushModule,
  ],
})
export class AppModule {}

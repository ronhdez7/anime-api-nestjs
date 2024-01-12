import { Module } from "@nestjs/common";
import { AnimeModule } from "./anime/anime.module";
import { NineAnimeService } from "./9anime/9anime.service";
import { NineAnimeModule } from "./9anime/9anime.module";
import { GogoanimeModule } from "./gogoanime/gogoanime.module";
import { AnicrushModule } from "./anicrush/anicrush.module";
import { AppController } from "./app.controller";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { ApiExceptionFilter } from "./errors/exception.filter";
import { ApiGeneralExceptionFilter } from "./errors/general-exception.filter";
import { SerializeInterceptor } from "./interceptors/serializer.interceptor";

@Module({
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ApiGeneralExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ApiExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SerializeInterceptor,
    },
  ],
  imports: [
    AnimeModule.register(NineAnimeService),
    NineAnimeModule,
    GogoanimeModule,
    AnicrushModule,
  ],
})
export class AppModule {}

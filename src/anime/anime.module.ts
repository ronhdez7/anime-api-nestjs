import { DynamicModule, Module, Type } from "@nestjs/common";
import { AnimeController } from "./anime.controller";
import { AnimeStreamingService } from "./anime.service";
import { ANIME_STREAMING_SERVICE } from "./anime.constants";
import { FetchModule } from "src/config/fetch.module";

@Module({})
export class AnimeModule {
  static register(
    DynamicAnimeStreamingService: Type<AnimeStreamingService>,
  ): DynamicModule {
    return {
      imports: [FetchModule],
      module: AnimeModule,
      controllers: [AnimeController],
      providers: [
        {
          provide: ANIME_STREAMING_SERVICE,
          useClass: DynamicAnimeStreamingService,
        },
      ],
    };
  }
}

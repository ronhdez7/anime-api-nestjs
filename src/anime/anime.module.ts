import { DynamicModule, Module, Type } from "@nestjs/common";
import { AnimeController } from "./anime.controller";
import { AnimeService } from "./anime.service";
import { ANIME_SERVICE } from "./anime.constants";
import { FetchModule } from "src/config/fetch.module";

@Module({})
export class AnimeModule {
  static register(DynamicAnimeService: Type<AnimeService>): DynamicModule {
    return {
      imports: [FetchModule],
      module: AnimeModule,
      controllers: [AnimeController],
      providers: [
        {
          provide: ANIME_SERVICE,
          useClass: DynamicAnimeService,
        },
      ],
    };
  }
}

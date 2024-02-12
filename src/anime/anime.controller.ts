import { Controller, Get, Inject, Query } from "@nestjs/common";
import { AnimeService } from "./anime.service";
import { ANIME_SERVICE, genres } from "./anime.constants";
import { BaseAnimeController } from "./base.controller";
import { SourceService } from "./sources/source.service";
import { ZodPipe } from "src/pipes/zod.pipe";
import { urlQueryParam } from "./validation/url-query.param";

@Controller()
export class AnimeController extends BaseAnimeController {
  constructor(
    @Inject(ANIME_SERVICE)
    protected readonly animeService: AnimeService,
    private readonly sourceService: SourceService,
  ) {
    super(animeService);
  }

  @Get("sources")
  async getSources(@Query("url", new ZodPipe(urlQueryParam)) url: string) {
    return await this.sourceService.getSources(decodeURIComponent(url));
  }

  @Get("all/genres")
  async getCommonGenres() {
    return genres;
  }
}

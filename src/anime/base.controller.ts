import { Get, Query } from "@nestjs/common";
import { AnimeService } from "./anime.service";
import { urlQueryParam } from "./validation/url-query.param";
import { ZodPipe } from "../pipes/zod.pipe";

export class BaseAnimeController {
  constructor(protected readonly animeService: AnimeService) {}

  @Get()
  async getRecommended() {
    return await this.animeService.getAnime();
  }

  @Get("filter")
  async filterAnime() {
    return await this.animeService.filterAnime({});
  }

  @Get("episodes")
  async getEpisodes(@Query("url", new ZodPipe(urlQueryParam)) url: string) {
    return await this.animeService.getEpisodes(url);
  }

  @Get("servers")
  async getServers(@Query("url", new ZodPipe(urlQueryParam)) url: string) {
    return await this.animeService.getServers(url);
  }
}

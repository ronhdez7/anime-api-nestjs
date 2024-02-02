import { Get, Query } from "@nestjs/common";
import { AnimeService } from "./anime.service";
import { urlQueryParam } from "./validation/url-query.param";
import { ZodPipe } from "../pipes/zod.pipe";

/**
 * Controller that all anime controllers extend
 */
export class BaseAnimeController {
  constructor(protected readonly animeService: AnimeService) {}

  @Get()
  async getAnime() {
    return await this.animeService.getAnime();
  }

  @Get("filter")
  async filterAnime(@Query() query: Record<string, string>) {
    const stringQuery = new URLSearchParams(query).toString();
    return await this.animeService.filterAnime(stringQuery);
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

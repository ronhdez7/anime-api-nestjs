import { Get, Query, Req } from "@nestjs/common";
import { AnimeStreamingService } from "./anime.service";
import { urlQueryParam } from "./validation/url-query.param";
import { ZodPipe } from "../pipes/zod.pipe";

export class BaseAnimeController {
  constructor(protected readonly streamingService: AnimeStreamingService) {}

  @Get()
  async getRecommended() {
    return await this.streamingService.getAnime();
  }

  @Get("filter")
  async filterAnime(@Query() query: Record<string, string>) {
    // convert query object to string
    const stringQuery = Object.keys(query).reduce((prev, key) => {
      return `${prev}${prev ? "&" : ""}${key}=${query[key]}`;
    }, "");
    return await this.streamingService.filterAnime(stringQuery);
  }

  @Get("episodes")
  async getEpisodes(@Query("url", new ZodPipe(urlQueryParam)) url: string) {
    return await this.streamingService.getEpisodes(url);
  }

  @Get("servers")
  async getServers(@Query("url", new ZodPipe(urlQueryParam)) url: string) {
    return await this.streamingService.getServers(url);
  }
}

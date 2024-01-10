import { Get, Query, ValidationPipe } from "@nestjs/common";
import { AnimeService } from "./anime.service";
import { UrlQueryDTO } from "./dto/url-query.dto";

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
  async getEpisodes(@Query(ValidationPipe) { url }: UrlQueryDTO) {
    return await this.animeService.getEpisodes(url);
  }

  @Get("servers")
  async getServers(@Query(ValidationPipe) { url }: UrlQueryDTO) {
    return await this.animeService.getServers(url);
  }
}

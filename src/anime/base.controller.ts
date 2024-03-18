import { Get, Param, Query } from "@nestjs/common";
import { AnimeService } from "./anime.service";
import { urlQueryParam } from "./validation/url-query.param";
import { ZodPipe } from "../pipes/zod.pipe";
import { RouterService } from "./router/router.service";

/**
 * Controller that all anime controllers extend
 */
export class BaseAnimeController {
  constructor(protected readonly animeService: AnimeService | RouterService) {}

  @Get("genres")
  getGenres() {
    return this.animeService.getGenres();
  }

  @Get("genres/:genre")
  getAnimeByGenre(@Param("genre") genre: string) {
    try {
      genre = decodeURIComponent(genre);
    } catch {}

    genre = genre = genre.trim().split(" ").join("-");

    return this.animeService.getAnimeByGenre(genre);
  }

  @Get()
  getAnime() {
    return this.animeService.getAnime();
  }

  @Get("scrape")
  scrapeAnime(@Query("url") url: string) {
    return this.animeService.scrapeAnime(url);
  }

  @Get("filter")
  filterAnime(@Query() query: Record<string, string>) {
    const stringQuery = new URLSearchParams(query).toString();
    return this.animeService.filterAnime(stringQuery);
  }

  @Get("episodes")
  getEpisodes(@Query("url", new ZodPipe(urlQueryParam)) url: string) {
    return this.animeService.getEpisodes(decodeURIComponent(url));
  }

  @Get("servers")
  getServers(@Query("url", new ZodPipe(urlQueryParam)) url: string) {
    return this.animeService.getServers(decodeURIComponent(url));
  }
}

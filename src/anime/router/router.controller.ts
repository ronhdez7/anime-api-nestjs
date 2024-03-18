import { Controller, Get, Redirect } from "@nestjs/common";
import { RouterService } from "./router.service";
import { BaseAnimeController } from "../base.controller";

@Controller()
export class RouterController extends BaseAnimeController {
  constructor(protected readonly animeService: RouterService) {
    super(animeService);
  }

  @Get("genres")
  @Redirect()
  override getGenres() {
    return super.getGenres();
  }

  @Get("genres/:genre")
  @Redirect()
  override getAnimeByGenre(genre: string) {
    return super.getAnimeByGenre(genre);
  }

  @Get()
  @Redirect()
  override getAnime() {
    return super.getAnime();
  }

  @Get("scrape")
  @Redirect()
  override scrapeAnime(url: string) {
    return super.scrapeAnime(url);
  }

  @Get("filter")
  @Redirect()
  override filterAnime(query: Record<string, string>) {
    return super.filterAnime(query);
  }

  @Get("episodes")
  @Redirect()
  override getEpisodes(url: any) {
    return super.getEpisodes(url);
  }

  @Get("servers")
  @Redirect()
  override getServers(url: any) {
    return super.getServers(url);
  }
}

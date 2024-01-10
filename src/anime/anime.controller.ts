import { Controller, Inject } from "@nestjs/common";
import { AnimeService } from "./anime.service";
import { ANIME_SERVICE } from "../app.constants";
import { BaseAnimeController } from "./base.controller";

@Controller()
export class AnimeController extends BaseAnimeController {
  constructor(
    @Inject(ANIME_SERVICE) protected readonly animeService: AnimeService,
  ) {
    super(animeService);
  }
}

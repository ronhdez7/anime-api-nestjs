import { Controller, Inject } from "@nestjs/common";
import { AnimeStreamingService } from "./anime.service";
import { ANIME_STREAMING_SERVICE } from "./anime.constants";
import { BaseAnimeController } from "./base.controller";

@Controller()
export class AnimeController extends BaseAnimeController {
  constructor(
    @Inject(ANIME_STREAMING_SERVICE)
    protected readonly streamingService: AnimeStreamingService,
  ) {
    super(streamingService);
  }
}

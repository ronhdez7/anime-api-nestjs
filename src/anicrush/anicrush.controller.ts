import { Controller } from "@nestjs/common";
import { AnicrushService } from "./anicrush.service";
import { BaseAnimeController } from "src/anime/base.controller";

@Controller("anicrush")
export class AnicrushController extends BaseAnimeController {
  constructor(protected readonly anicrushService: AnicrushService) {
    super(anicrushService);
  }
}

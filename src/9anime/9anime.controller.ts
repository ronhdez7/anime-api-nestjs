import { Controller } from "@nestjs/common";
import { NineAnimeService } from "./9anime.service";
import { BaseAnimeController } from "src/anime/base.controller";

@Controller("9anime")
export class NineAnimeController extends BaseAnimeController {
  constructor(protected readonly nineanimeService: NineAnimeService) {
    super(nineanimeService);
  }
}

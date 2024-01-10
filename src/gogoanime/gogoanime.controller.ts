import { Controller } from "@nestjs/common";
import { GogoanimeService } from "./gogoanime.service";
import { BaseAnimeController } from "src/anime/base.controller";

@Controller("gogoanime")
export class GogoanimeController extends BaseAnimeController {
  constructor(protected readonly gogoanimeService: GogoanimeService) {
    super(gogoanimeService);
  }
}

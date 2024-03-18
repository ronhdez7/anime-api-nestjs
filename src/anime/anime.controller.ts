import { Controller, Get } from "@nestjs/common";
import { genres } from "./anime.constants";

@Controller()
export class AnimeController {
  @Get("shared/genres")
  async getSharedGenres() {
    return genres;
  }
}

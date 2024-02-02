import { Module } from "@nestjs/common";
import { NineAnimeController } from "./9anime.controller";
import { NineAnimeService } from "./9anime.service";

@Module({
  controllers: [NineAnimeController],
  providers: [NineAnimeService],
})
export class NineAnimeModule {}

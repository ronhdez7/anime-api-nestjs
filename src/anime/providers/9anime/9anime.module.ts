import { Module } from "@nestjs/common";
import { NineAnimeController } from "./9anime.controller";
import { NineAnimeService } from "./9anime.service";
import { FetchModule } from "src/config/fetch.module";

@Module({
  controllers: [NineAnimeController],
  providers: [NineAnimeService],
  imports: [FetchModule],
})
export class NineAnimeModule {}

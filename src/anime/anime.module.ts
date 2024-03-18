import { Module } from "@nestjs/common";
import { AnimeController } from "./anime.controller";
import { SourceModule } from "./sources/source.module";
import { AnimeRouterModule } from "./router/router.module";

@Module({
  imports: [SourceModule, AnimeRouterModule],
  controllers: [AnimeController],
})
export class AnimeModule {}

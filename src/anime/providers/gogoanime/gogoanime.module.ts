import { Module } from "@nestjs/common";
import { GogoanimeService } from "./gogoanime.service";
import { GogoanimeController } from "./gogoanime.controller";
import { FetchModule } from "src/config/fetch.module";

@Module({
  controllers: [GogoanimeController],
  providers: [GogoanimeService],
  imports: [FetchModule],
})
export class GogoanimeModule {}

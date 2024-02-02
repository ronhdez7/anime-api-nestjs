import { Module } from "@nestjs/common";
import { GogoanimeService } from "./gogoanime.service";
import { GogoanimeController } from "./gogoanime.controller";

@Module({
  controllers: [GogoanimeController],
  providers: [GogoanimeService],
})
export class GogoanimeModule {}

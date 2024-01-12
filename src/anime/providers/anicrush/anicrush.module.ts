import { Module } from "@nestjs/common";
import { AnicrushService } from "./anicrush.service";
import { AnicrushController } from "./anicrush.controller";
import { FetchModule } from "src/config/fetch.module";

@Module({
  controllers: [AnicrushController],
  providers: [AnicrushService],
  imports: [FetchModule],
})
export class AnicrushModule {}

import { Module } from "@nestjs/common";
import { AnicrushService } from "./anicrush.service";
import { AnicrushController } from "./anicrush.controller";

@Module({
  controllers: [AnicrushController],
  providers: [AnicrushService],
})
export class AnicrushModule {}

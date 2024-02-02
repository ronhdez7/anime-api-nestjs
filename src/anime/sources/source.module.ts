import { Module } from "@nestjs/common";
import { SourceService } from "./source.service";
import { FetchModule } from "src/config/fetch.module";

@Module({
  imports: [FetchModule],
  providers: [SourceService],
  exports: [SourceService],
})
export class SourceModule {}

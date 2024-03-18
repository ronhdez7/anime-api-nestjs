import { Controller, Get, Query } from "@nestjs/common";
import { SourceService } from "./source.service";
import { ZodPipe } from "src/pipes/zod.pipe";
import { urlQueryParam } from "../validation/url-query.param";

@Controller("sources")
export class SourceController {
  constructor(private readonly sourceService: SourceService) {}

  @Get()
  async getSources(@Query("url", new ZodPipe(urlQueryParam)) url: string) {
    return await this.sourceService.getSources(decodeURIComponent(url));
  }
}

import { SourceResult } from "src/anime/interfaces/anime.interface";
import { SourceName } from "../interfaces/source.interface";
import { SourceServiceGateway } from "../source.gateway";
import { getVideoSource } from "../shared/get-video-source";
import { HttpService } from "@nestjs/axios";

export class RapidCloudSourceGateway implements SourceServiceGateway {
  SOURCE_NAME: SourceName = "RAPIDCLOUD";

  constructor(private readonly httpService: HttpService) {}

  async getSources(playerUrl: string): Promise<SourceResult> {
    return await getVideoSource(this.httpService, playerUrl);
  }
}

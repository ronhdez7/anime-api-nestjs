import { SourceResult } from "src/anime/interfaces/anime.interface";
import { SourceName } from "../interfaces/source.interface";
import { SourceServiceGateway } from "../source.gateway";
import { getVideoSource } from "../shared/get-video-source";
import { HttpService } from "@nestjs/axios";

export class SouthCloudSourceGateway implements SourceServiceGateway {
  SOURCE_NAME: SourceName = "SOUTHCLOUD";

  constructor(private readonly httpService: HttpService) {}

  async getSources(playerUrl: string): Promise<SourceResult> {
    return await getVideoSource(this.httpService, playerUrl);
  }
}

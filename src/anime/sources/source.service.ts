import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { SourceResult } from "src/anime/interfaces/anime.interface";
import { SourceName } from "./interfaces/source.interface";
import { SourceServiceGateway } from "./source.gateway";
import { RapidCloudSourceGateway } from "./gateways/rapidcloud.gateway";
import { SouthCloudSourceGateway } from "./gateways/southcloud.gateway";
import { EmbtakuSourceGateway } from "./gateways/embtaku.gateway";
import { ApiException } from "src/errors/http.exception";
import { StreamwishSourceGateway } from "./gateways/streamwish.gateway";

@Injectable()
export class SourceService {
  readonly SOURCES: Record<SourceName, SourceServiceGateway>;

  constructor(private readonly httpService: HttpService) {
    this.SOURCES = {
      RAPIDCLOUD: new RapidCloudSourceGateway(this.httpService),
      SOUTHCLOUD: new SouthCloudSourceGateway(this.httpService),
      EMBTAKU: new EmbtakuSourceGateway(this.httpService),
      STREAMWISH: new StreamwishSourceGateway(this.httpService),
    };
  }

  /**
   * Gets the url to .m3u8 files needed to load the video
   * @param playerUrl The url of the player provided by one of the servers
   */
  getSources(playerUrl: string): Promise<SourceResult> {
    const sourceName = this.extractSourceName(playerUrl);
    const source = this.SOURCES[sourceName];

    return source.getSources(playerUrl);
  }

  extractSourceName(playerUrl: string): SourceName {
    const { host } = new URL(playerUrl);

    let sourceName: SourceName;
    if (host === "rapid-cloud.co") {
      sourceName = "RAPIDCLOUD";
    } else if (host === "southcloud.tv") {
      sourceName = "SOUTHCLOUD";
    } else if (host === "embtaku.pro") {
      sourceName = "EMBTAKU";
    } else if (host === "awish.pro" || host === "streamwish.com") {
      sourceName = "STREAMWISH";
    } else {
      throw new ApiException("Url source is invalid or not implemented", 400);
    }

    return sourceName;
  }
}

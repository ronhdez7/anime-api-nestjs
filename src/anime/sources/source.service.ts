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
import { MP4UploadSourceGateway } from "./gateways/mp4upload.gateway";
import { DoodstreamSourceGateway } from "./gateways/doodstream.gateway";

@Injectable()
export class SourceService {
  readonly SOURCES: Record<SourceName, SourceServiceGateway>;

  constructor(private readonly httpService: HttpService) {
    this.SOURCES = {
      RAPIDCLOUD: new RapidCloudSourceGateway(this.httpService),
      SOUTHCLOUD: new SouthCloudSourceGateway(this.httpService),
      EMBTAKU: new EmbtakuSourceGateway(this.httpService),
      STREAMWISH: new StreamwishSourceGateway(this.httpService),
      MP4UPLOAD: new MP4UploadSourceGateway(this.httpService),
      DOODSTREAM: new DoodstreamSourceGateway(this.httpService),
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
    if (host.includes("rapid-cloud")) {
      sourceName = "RAPIDCLOUD";
    } else if (host.includes("southcloud")) {
      sourceName = "SOUTHCLOUD";
    } else if (host.includes("embtaku")) {
      sourceName = "EMBTAKU";
    } else if (host.includes("awish") || host.includes("streamwish")) {
      sourceName = "STREAMWISH";
    } else if (host.includes("mp4upload")) {
      sourceName = "MP4UPLOAD";
    } else if (host.includes("dood")) {
      sourceName = "DOODSTREAM";
    } else {
      throw new ApiException("Url source is invalid or not implemented", 400);
    }

    return sourceName;
  }
}

import { SourceResult } from "src/anime/interfaces/anime.interface";
import { SourceName } from "../interfaces/source.interface";
import { SourceServiceGateway } from "../source.gateway";
import { HttpService } from "@nestjs/axios";
import { ApiException } from "src/errors/http.exception";
import { StreamwishPlayerSetup } from "../interfaces/streamwish.interface";

export class StreamwishSourceGateway implements SourceServiceGateway {
  SOURCE_NAME: SourceName = "STREAMWISH";

  constructor(private readonly httpService: HttpService) {}

  async getSources(playerUrl: string): Promise<SourceResult> {
    let playerHtml: string;
    try {
      playerHtml = (await this.httpService.axiosRef.get(playerUrl)).data;
    } catch (err) {
      throw new ApiException("Invalid url", 400, { cause: err });
    }

    const textsetup: string =
      playerHtml
        .match(/(?<=jwplayer\("vplayer"\)\.setup\()[^]+?(?=\);)/gm)
        ?.at(0) ?? "";

    let setup: StreamwishPlayerSetup;
    try {
      setup = eval(`(${textsetup})`);
      if (!setup) throw new Error();
    } catch (err) {
      throw new ApiException("Make sure url is correct", 500, {
        description: "Could not parse player html",
      });
    }

    return {
      sources: setup.sources.map((s) => ({
        url: s.file,
        type: (s as any).type ?? "",
      })),
      tracks: setup.tracks,
      intro: { start: 0, end: 0 },
      outro: { start: 0, end: 0 },
      server: -1,
      playerUrl,
      title: setup.title,
      thumbnail: setup.image,
      duration: Number(setup.duration) ?? undefined,
    };
  }
}

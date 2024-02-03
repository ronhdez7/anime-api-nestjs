import { SourceResult } from "src/anime/interfaces/anime.interface";
import { SourceName } from "../interfaces/source.interface";
import { SourceServiceGateway } from "../source.gateway";
import { HttpService } from "@nestjs/axios";
import { ApiException } from "src/errors/http.exception";

export class MP4UploadSourceGateway implements SourceServiceGateway {
  SOURCE_NAME: SourceName = "MP4UPLOAD";

  constructor(private readonly httpService: HttpService) {}

  async getSources(playerUrl: string): Promise<SourceResult> {
    let playerHtml: string;
    try {
      playerHtml = (await this.httpService.axiosRef.get(playerUrl)).data;
    } catch (err) {
      throw new ApiException("Invalid url", 400, { cause: err });
    }

    let source: { src: string; type: string };
    try {
      source = eval(
        `(${playerHtml.match(/(?<=player\.src\()[^]+?(?=\);)/)?.at(0) ?? ""})`,
      );
      if (!source) throw new Error();
    } catch (err) {
      throw new ApiException("Make sure url is correct", 500, {
        description: "Could not parse player html",
      });
    }
    const imgsrc =
      playerHtml.match(/(?<=player\.poster\(")[^]+?(?="\);)/)?.at(0) ?? "";

    return {
      sources: [{ url: source.src, type: source.type }],
      tracks: [],
      intro: { start: 0, end: 0 },
      outro: { start: 0, end: 0 },
      server: -1,
      playerUrl,
      duration: -1,
      thumbnail: imgsrc,
      title: undefined,
    };
  }
}

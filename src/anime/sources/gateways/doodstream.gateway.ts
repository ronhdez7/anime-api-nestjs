import { SourceResult } from "src/anime/interfaces/anime.interface";
import { SourceName } from "../interfaces/source.interface";
import { SourceServiceGateway } from "../source.gateway";
import { HttpService } from "@nestjs/axios";
import { ApiException } from "src/errors/http.exception";
import * as cheerio from "cheerio";

export class DoodstreamSourceGateway implements SourceServiceGateway {
  SOURCE_NAME: SourceName = "DOODSTREAM";
  BASE_URL = "https://dood.wf";
  private FAKE_USER_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0";

  constructor(private readonly httpService: HttpService) {}

  async getSources(playerUrl: string): Promise<SourceResult> {
    let playerHtml: string;
    try {
      playerHtml = (
        await this.httpService.axiosRef.get(playerUrl, {
          headers: {
            "User-Agent": this.FAKE_USER_AGENT,
          },
        })
      ).data;
    } catch (err) {
      throw new ApiException("Invalid url", 400, { cause: err });
    }

    const passUrl =
      playerHtml.match(/(?<=\$\.get\(')\/pass_md5\/.+?(?=',)/)?.at(0) ?? "";

    let sourceBaseUrl: string;
    try {
      sourceBaseUrl = (
        await this.httpService.axiosRef.get(this.BASE_URL + passUrl, {
          headers: {
            Referer: playerUrl,
            "User-Agent": this.FAKE_USER_AGENT,
          },
        })
      ).data;
      if (!sourceBaseUrl) throw new Error();
    } catch (err) {
      throw new ApiException("Internal server error happened", 500, {
        cause: err,
        description: "Check url is correct",
      });
    }
    const endUrl = playerHtml.match(/(?<=")\?token=.+?&expiry=/)?.at(0) ?? "";
    const finalUrl = `${sourceBaseUrl}abcdefghij${endUrl}${Date.now()}`;

    const $ = cheerio.load(playerHtml);
    const thumbnail = $("#video_player").attr("poster") ?? null;

    return {
      sources: [
        {
          url: finalUrl,
          type: "hls",
        },
      ],
      tracks: [],
      intro: { start: 0, end: 0 },
      outro: { start: 0, end: 0 },
      playerUrls: [playerUrl],
      duration: -1,
      thumbnail,
    };
  }
}

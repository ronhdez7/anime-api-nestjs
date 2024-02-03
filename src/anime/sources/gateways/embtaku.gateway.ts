import { SourceResult } from "src/anime/interfaces/anime.interface";
import { SourceName } from "../interfaces/source.interface";
import { SourceServiceGateway } from "../source.gateway";
import { HttpService } from "@nestjs/axios";
import { ApiException } from "src/errors/http.exception";
import * as cheerio from "cheerio";
import { decrypt, encrypt } from "../shared/cypher";
import { EmbtakuSourceResult } from "../interfaces/embtaku.interface";

export class EmbtakuSourceGateway implements SourceServiceGateway {
  readonly SOURCE_NAME: SourceName = "EMBTAKU";

  constructor(private readonly httpService: HttpService) {}

  async getSources(playerUrl: string): Promise<SourceResult> {
    const urlobj = new URL(playerUrl);

    // extract anime id
    const animeId = urlobj.searchParams.get("id");
    if (!animeId) {
      throw new ApiException("No valid id found", 400, {
        description: "Anime id must be provided to query parameter 'id'",
      });
    }

    // load cheerio with player html
    let playerHtml: string;
    try {
      playerHtml = (await this.httpService.axiosRef.get(playerUrl)).data;
    } catch (err) {
      throw new ApiException("Player url is invalid", 404, {
        description: "Failed to request player html",
      });
    }
    const $ = cheerio.load(playerHtml);

    // got from player html
    const keys = {
      firstKey: "37911490979715163134003223491201", // to send request
      secondKey: "54674138327930866480207815084989", // to decrypt response
      iv: "3134003223491201",
    };

    try {
      const cryptojsValue: string =
        ($(`script[data-name="episode"]`).data("value") as string) ?? "";
      const decrypted = decrypt(cryptojsValue, keys.firstKey, keys.iv);

      const alias = decrypted.substring(0, decrypted.indexOf("&"));

      const idParam = encrypt(alias, keys.firstKey, keys.iv);

      const url = `${urlobj.origin}/encrypt-ajax.php?${decrypted
        .substring(decrypted.indexOf("&"))
        .slice(1)}&id=${idParam}&alias=${animeId}`;

      const encryptedSource = (
        await this.httpService.axiosRef.get(url, {
          headers: {
            /* necessary */
            "X-Requested-With": "XMLHttpRequest",
          },
        })
      ).data.data;

      const source: EmbtakuSourceResult = JSON.parse(
        decrypt(encryptedSource, keys.secondKey, keys.iv),
      );

      return {
        sources: [
          ...source.source.map((s) => ({ url: s.file, type: s.type })),
          ...source.source_bk.map((s) => ({ url: s.file, type: s.type })),
        ],
        tracks: source.track.tracks ?? [],
        intro: { start: 0, end: 0 },
        outro: { start: 0, end: 0 },
        server: -1,
        playerUrl: source.linkiframe ?? playerUrl,
      };
    } catch (err) {
      throw new ApiException("Internal server error", 500, {
        cause: err,
        description: "Failed to decrypt source",
      });
    }
  }
}

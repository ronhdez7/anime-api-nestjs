import { Injectable } from "@nestjs/common";
import { AnimeService } from "src/anime/anime.service";
import {
  AnimeCard,
  AnimeFilterOptions,
  EpisodeCard,
  ServerCard,
  SourceCard,
} from "src/anime/interfaces/anime.interface";
import * as cheerio from "cheerio";
import { ANIME_PROVIDER } from "src/anime/anime.constants";
import { HttpService } from "@nestjs/axios";
import {
  animePageNotFoundError,
  episodePageNotFoundError,
  serverPageNotFoundError,
} from "src/anime/errors/not-found.error";
import { AES, enc } from "crypto-js";
import { ApiException } from "src/errors/http.exception";

@Injectable()
export class GogoanimeService implements AnimeService {
  readonly GOGOANIME_URL = "https://anitaku.to";
  readonly GOGOANIME_EPISODES_URL =
    "https://ajax.gogo-load.com/ajax/load-list-episode?ep_start=0&ep_end=10000&id=";

  constructor(private readonly httpService: HttpService) {}

  async getAnime(): Promise<AnimeCard[]> {
    return await this.scrapeAnime("/home.html");
  }

  async scrapeAnime(url: string): Promise<AnimeCard[]> {
    if (url.startsWith("/")) {
      url = this.GOGOANIME_URL + url;
    }

    let html: string;
    try {
      html = (await this.httpService.axiosRef.get(url)).data;
    } catch (err) {
      throw animePageNotFoundError(err);
    }

    const $ = cheerio.load(html);

    const animes: AnimeCard[] = [];

    $("div.last_episodes > ul.items > li").each((_, el) => {
      const jname = $(el).find("p.name").text();

      const sub = $(el).find("div.img div.type.ic-SUB").length !== 0;
      const dub = $(el).find("div.img div.type.ic-DUB").length !== 0;
      // const raw = $(el).find("div.img div.type.ic-RAW").length !== 0;

      let image = $(el).find("div.img img").attr("src")?.trim() ?? null;
      if (image?.startsWith("/")) {
        image = this.GOGOANIME_URL + image;
      }

      let link = $(el).find("div.img a").attr("href")?.trim() ?? null;
      if (link?.startsWith("/")) {
        link = this.GOGOANIME_URL + link;
      }

      const card: AnimeCard = {
        provider: ANIME_PROVIDER.GOGOANIME,
        name: null,
        jname,
        image,
        link,
        audioType: {
          sub,
          dub,
        },
        quality: null,
        filmType: null,
      };

      animes.push(card);
    });

    return animes;
  }

  async filterAnime(
    options: AnimeFilterOptions | string,
  ): Promise<AnimeCard[]> {
    let url = `${this.GOGOANIME_URL}/filter.html?`;

    if (typeof options === "string") {
      url += options;
    } else {
      const keyword = options.keyword ?? "";
      const type = options.type ?? "";
      const status = options.status ?? "all";
      const season = options.season ?? "";
      const language = options.language ?? "";
      const sort = options.sort ?? "default";
      const year = options.year ?? "";
      const genre = (options.genres ?? []).join(",");
      const page = options.page ?? "";

      url += `keyword=${keyword}&type=${type}&status=${status}&season=${season}&language=${language}&sort=${sort}&year=${year}&genre=${genre}&page=${page}`;
    }

    return await this.scrapeAnime(url);
  }

  async getEpisodes(animeUrl: string): Promise<EpisodeCard[]> {
    const animeId = await this.getIdFromUrl(animeUrl);

    if (animeId < 0) return [];

    let html: string;
    try {
      html = (
        await this.httpService.axiosRef.get(
          `${this.GOGOANIME_EPISODES_URL}${animeId}`,
        )
      ).data;
    } catch (err) {
      throw episodePageNotFoundError(err);
    }

    if (!html) throw episodePageNotFoundError("No episodes");

    const $ = cheerio.load(html);

    const episodes: EpisodeCard[] = [];
    $("li").each((_, el) => {
      const name = $(el).find("div.name").text();
      // const sub = $(el).find("div.cate").text().trim() === "SUB";
      const number = parseInt(name.slice(name.search(/(?<= )\d+$/))) ?? -1;

      let link = $(el).find("a").attr("href")?.trim() ?? "";
      if (link?.startsWith("/")) {
        link = this.GOGOANIME_URL + link;
      }

      const card: EpisodeCard = {
        provider: ANIME_PROVIDER.GOGOANIME,
        name,
        number,
        link,
      };

      episodes.push(card);
    });

    return episodes;
  }

  async getServers(episodeUrl: string): Promise<ServerCard[]> {
    if (episodeUrl.startsWith("/")) {
      episodeUrl = this.GOGOANIME_URL + episodeUrl;
    }

    let html: string;
    try {
      html = (await this.httpService.axiosRef.get(episodeUrl)).data;
    } catch (err) {
      throw serverPageNotFoundError(err);
    }

    const $ = cheerio.load(html);

    const servers: ServerCard[] = [];
    $("div.anime_muti_link > ul > li").each((_, el) => {
      const name =
        $(el).text().split("Choose this server")?.at(0)?.trim() ?? "";

      const id = parseInt($(el).find("a").attr("rel") ?? "-1");

      let link = $(el).find("a").attr("data-video") ?? null;
      if (link?.startsWith("/")) {
        link = this.GOGOANIME_URL + link;
      }

      const type = $(el).attr("data-type") ?? "sub";

      const card: ServerCard = {
        provider: ANIME_PROVIDER.GOGOANIME,
        name,
        id,
        link,
        type,
        player: {
          link: link ?? "",
        },
      };

      servers.push(card);
    });

    return servers;
  }

  async getSources(playerUrl: string): Promise<SourceCard> {
    const urlobj = new URL(playerUrl);

    // extract anime id
    const animeId = urlobj.searchParams.get("id"); // playerUrl.match(/(?<=id=).+(?=&|$)/)?.at(0) ?? "";
    if (!animeId) {
      throw new ApiException("No valid id found", 400, {
        description: "Anime id must be provided to query parameter 'id'",
      });
    }

    // load cheerio with plauer html
    let playerHtml: string;
    try {
      playerHtml = (await this.httpService.axiosRef.get(playerUrl)).data;
    } catch (err) {
      throw new ApiException("Player url is invalid", 400, {
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
      const decrypted = enc.Utf8.stringify(
        AES.decrypt(cryptojsValue, enc.Utf8.parse(keys.firstKey), {
          iv: enc.Utf8.parse(keys.iv),
        }),
      );

      const alias = decrypted.substring(0, decrypted.indexOf("&"));

      const idParam = AES.encrypt(alias, enc.Utf8.parse(keys.firstKey), {
        iv: enc.Utf8.parse(keys.iv),
      }).toString();

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

      const source = JSON.parse(
        enc.Utf8.stringify(
          AES.decrypt(encryptedSource, enc.Utf8.parse(keys.secondKey), {
            iv: enc.Utf8.parse(keys.iv),
          }),
        ),
      );

      return { url: source.source[0].file };
    } catch (err) {
      throw new ApiException("Internal server error", 500, {
        cause: err,
        description: "Failed to decrypt source",
      });
    }
  }

  private async getIdFromUrl(url: string): Promise<number> {
    if (url.startsWith("/")) {
      url = this.GOGOANIME_URL + url;
    }

    let html: string;
    try {
      html = (await this.httpService.axiosRef.get(url)).data;
    } catch (err) {
      console.log(err);
      return -1;
    }

    const $ = cheerio.load(html);

    const id =
      Number(
        $("input#movie_id.movie_id[type=hidden]").val()?.toString() ?? "-1",
      ) ?? -1;

    return id;
  }
}

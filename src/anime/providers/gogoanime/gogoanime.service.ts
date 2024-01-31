import { Injectable } from "@nestjs/common";
import { AnimeService } from "src/anime/anime.service";
import {
  AnimeResult,
  AnimeFilterOptions,
  EpisodeResult,
  ServerResult,
  AnimeProvider,
  SourceResult,
} from "src/anime/interfaces/anime.interface";
import * as cheerio from "cheerio";
import { HttpService } from "@nestjs/axios";
import {
  animePageNotFoundError,
  episodePageNotFoundError,
  serverPageNotFoundError,
} from "src/anime/errors/not-found.error";
import { ApiException } from "src/errors/http.exception";
import { GogoanimeSourceResult } from "./interfaces/gogoanime.interface";
import { decrypt, encrypt } from "../shared/cypher";

@Injectable()
export class GogoanimeService implements AnimeService {
  readonly PROVIDER: AnimeProvider = "GOGOANIME";
  readonly GOGOANIME_URL = "https://anitaku.to";
  readonly GOGOANIME_EPISODES_URL =
    "https://ajax.gogo-load.com/ajax/load-list-episode?ep_start=0&ep_end=10000&id=";

  constructor(private readonly httpService: HttpService) {}

  async getAnime(): Promise<AnimeResult[]> {
    return await this.scrapeAnime("/home.html");
  }

  async scrapeAnime(url: string): Promise<AnimeResult[]> {
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

    const animes: AnimeResult[] = [];

    $("div.last_episodes > ul.items > li").each((_, el) => {
      const jname = $(el).find("p.name").text().trim() || null;

      const sub = $(el).find("div.img div.type.ic-SUB").length !== 0;
      const dub = $(el).find("div.img div.type.ic-DUB").length !== 0;
      const episodeCount =
        Number($(el).find("p.episode").text().trim().split(" ").at(-1)) || null;

      // get url
      let url = $(el).find("div.img a").attr("href")?.trim();
      if (!url) return;
      else if (url.startsWith("/")) {
        url = this.GOGOANIME_URL + url;
      }
      if (url.startsWith(`${this.GOGOANIME_URL}/category/`)) {
        const slug = url.split("/").at(-1) ?? "";
        url = `${this.GOGOANIME_URL}/${slug}-episode-${episodeCount ?? 1}`;
      }

      let image = $(el).find("div.img img").attr("src")?.trim() || null;
      if (image?.startsWith("/")) {
        image = this.GOGOANIME_URL + image;
      }

      const card: AnimeResult = {
        provider: this.PROVIDER,
        name: null,
        jname,
        image,
        url,
        audioType: {
          sub,
          dub,
        },
        quality: null,
        filmType: null,
        episodeCount,
      };

      animes.push(card);
    });

    return animes;
  }

  async filterAnime(
    options: AnimeFilterOptions | string,
  ): Promise<AnimeResult[]> {
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

  async getEpisodes(animeUrl: string): Promise<EpisodeResult[]> {
    const animeId = await this.getIdFromUrl(animeUrl);

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

    const episodes: EpisodeResult[] = [];
    $("li").each((_, el) => {
      const name = $(el).find("div.name").text().trim();
      // const sub = $(el).find("div.cate").text().trim() === "SUB";
      const number = Number(name.split(" ").at(-1)?.trim()) ?? -1;
      let url = $(el).find("a").attr("href")?.trim() || null;
      if (url?.startsWith("/")) {
        url = this.GOGOANIME_URL + url;
      }

      const card: EpisodeResult = {
        provider: this.PROVIDER,
        providerId: number,
        name: null,
        jname: name,
        number,
        url,
      };

      episodes.push(card);
    });

    return episodes;
  }

  async getServers(episodeUrl: string): Promise<ServerResult[]> {
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

    const servers: ServerResult[] = [];
    $("div.anime_muti_link > ul > li").each((_, el) => {
      const name =
        $(el).text().split("Choose this server")?.at(0)?.trim() ?? "";

      const serverNumber = Number($(el).find("a").attr("rel")) ?? -1;

      let url = ($(el).find("a").data("video") as string) || null;
      if (!url) return;
      if (url.startsWith("/")) {
        url = this.GOGOANIME_URL + url;
      }

      const audioType = ($(el).data("type") as string) ?? "sub";

      const card: ServerResult = {
        provider: this.PROVIDER,
        name,
        serverNumber,
        url,
        audioType,
        playerUrl: url,
      };

      servers.push(card);
    });

    return servers;
  }

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

      const source: GogoanimeSourceResult = JSON.parse(
        decrypt(encryptedSource, keys.secondKey, keys.iv),
      );

      return {
        sources: [
          ...source.source.map((s) => ({ url: s.file, type: s.type })),
          ...source.source_bk.map((s) => ({ url: s.file, type: s.type })),
        ],
        tracks: source.track.tracks,
        intro: { start: 0, end: 0 },
        outro: { start: 0, end: 0 },
        server: -1,
        playerUrl: source.linkiframe,
      };
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
      throw new ApiException("Invalid anime url", 400, {
        description: "Request to provided url failed",
      });
    }

    const $ = cheerio.load(html);

    const id = Number($("input#movie_id.movie_id[type=hidden]").val()) ?? -1;

    if (!id || id < 0) {
      throw new ApiException("Invalid anime url", 400, {
        description: "Could not get valid id from url",
      });
    }

    return id;
  }
}

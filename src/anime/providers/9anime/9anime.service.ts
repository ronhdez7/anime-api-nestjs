import { Injectable } from "@nestjs/common";
import { AnimeService } from "src/anime/anime.service";
import {
  AnimeResult,
  AnimeFilterOptions,
  EpisodeResult,
  ServerResult,
  AnimeProvider,
  AnimeFilmType,
  GenreResult,
} from "src/anime/interfaces/anime.interface";
import * as cheerio from "cheerio";
import {
  NineAnimeApiResponse,
  NineAnimeSourceApiResponse,
} from "./interfaces/9anime.interface";
import {
  animePageNotFoundError,
  episodePageNotFoundError,
  serverPageNotFoundError,
} from "src/anime/errors/not-found.error";
import { HttpService } from "@nestjs/axios";
import { ApiException } from "src/errors/http.exception";

@Injectable()
export class NineAnimeService implements AnimeService {
  readonly PROVIDER: AnimeProvider = "9ANIME";
  readonly NINEANIME_URL = "https://9animetv.to";

  constructor(private readonly httpService: HttpService) {}

  async getGenres(): Promise<GenreResult[]> {
    let html: string;
    try {
      html = (await this.httpService.axiosRef.get(`${this.NINEANIME_URL}/home`))
        .data;
    } catch (err) {
      throw animePageNotFoundError(err);
    }
    const $ = cheerio.load(html);

    const genres: GenreResult[] = [];
    $(`a[title="Genres"] + div > ul > li > a`).each((_, a) => {
      const title = $(a).text().trim();
      let url = $(a).attr("href")?.trim();
      if (!url) return;

      const genre: GenreResult = { url, title };
      genres.push(genre);
    });

    return genres;
  }

  async getAnime(): Promise<AnimeResult[]> {
    return await this.scrapeAnime("/home");
  }

  async scrapeAnime(url: string): Promise<AnimeResult[]> {
    if (url.startsWith("/")) {
      url = this.NINEANIME_URL + url;
    }

    let html: string;
    try {
      html = (await this.httpService.axiosRef.get(url)).data;
    } catch (err) {
      throw animePageNotFoundError(err);
    }
    const $ = cheerio.load(html);

    const animes: AnimeResult[] = [];
    $("div.film_list-wrap")
      .children()
      .each((_, el) => {
        // skip anime if url is not found
        let url = $(el).find("a.film-poster-ahref").attr("href")?.trim();
        if (!url) return;
        else if (url.startsWith("/")) {
          url = this.NINEANIME_URL + url;
        }

        const name = $(el).find("a.dynamic-name").attr("title") ?? null;
        const jname = $(el).find("a.dynamic-name").attr("data-jname") ?? null;
        const sub = $(el).find("div.tick-sub").text().trim() === "SUB";
        const dub = $(el).find("div.tick-dub").text().trim() === "DUB";
        const quality = $(el).find("div.tick-quality").text().trim() || null;
        let filmType: AnimeFilmType | null = null;
        // get episode number
        const episodeText =
          $(el).find("div.tick-eps").text().trim().split(" ")[1] ?? null;
        let episodeCount: number | null = null;
        if (!episodeText) episodeCount = null;
        else if (episodeText === "Full") {
          episodeCount = 1;
          filmType = "MOVIE";
        } else if (episodeText.includes("/")) {
          episodeCount = Number(episodeText.split("/")[0]) || null;
        } else if (Number(episodeText)) {
          episodeCount = Number(episodeText);
          filmType = "TV";
        }

        let image =
          $(el).find("img.film-poster-img").attr("data-src")?.trim() ?? null;
        if (image?.startsWith("/")) {
          image = this.NINEANIME_URL + image;
        }

        const card: AnimeResult = {
          provider: this.PROVIDER,
          name,
          jname,
          image,
          url,
          audioType: {
            sub,
            dub,
          },
          filmType,
          quality: quality && quality !== "N/A" ? quality : null,
          episodeCount: episodeCount || null,
        };

        animes.push(card);
      });

    return animes;
  }

  async filterAnime(
    options: AnimeFilterOptions | string,
  ): Promise<AnimeResult[]> {
    let url: string = `${this.NINEANIME_URL}/filter?`;
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
      const genre = options.genres ?? "";
      const page = options.page ?? "";

      url += `keyword=${keyword}&type=${type}&status=${status}&season=${season}&language=${language}&sort=${sort}&year=${year}&genre=${genre}&page=${page}`;
    }

    return await this.scrapeAnime(url);
  }

  async getEpisodes(animeUrl: string): Promise<EpisodeResult[]> {
    const animeId = Number(new URL(animeUrl).pathname.split("-").at(-1)) ?? -1;
    if (!animeId || animeId < 0) {
      throw new ApiException("Could not get anime id", 400, {
        description: "Anime id must be provided at end `...-<id>`",
      });
    }

    let data: NineAnimeApiResponse;
    try {
      data = (
        await this.httpService.axiosRef.get<NineAnimeApiResponse>(
          `${this.NINEANIME_URL}/ajax/episode/list/${animeId}`,
        )
      ).data;
    } catch (err) {
      throw episodePageNotFoundError(err);
    }
    if (!data || !data.status) throw episodePageNotFoundError();

    const $ = cheerio.load(data.html);

    if (!$("div.block_area-content").text().trim()) {
      throw episodePageNotFoundError("No episodes");
    }

    const episodes: EpisodeResult[] = [];

    $("div.episodes-ul > a.item").each((_, el) => {
      const name = $(el).attr("title")?.trim() ?? null;
      const number = Number($(el).attr("data-number")?.trim()) ?? -1;

      const id = Number($(el).attr("data-id")?.trim()) ?? -1;

      let url = $(el).attr("href")?.trim() || null;
      if (url?.startsWith("/")) {
        url = this.NINEANIME_URL + url;
      }

      const card: EpisodeResult = {
        provider: this.PROVIDER,
        providerId: id,
        name,
        jname: null,
        number,
        url,
      };

      episodes.push(card);
    });

    return episodes;
  }

  async getServers(episodeUrl: string): Promise<ServerResult[]> {
    const episodeId = Number(new URL(episodeUrl).searchParams.get("ep")) ?? -1;
    if (!episodeId || episodeId < 0) {
      throw new ApiException("Could not get episode id", 400, {
        description: "Episode id must be provided to query param `episodeId`",
      });
    }

    let data: NineAnimeApiResponse;
    try {
      data = (
        await this.httpService.axiosRef.get<NineAnimeApiResponse>(
          `${this.NINEANIME_URL}/ajax/episode/servers?episodeId=${episodeId}`,
        )
      ).data;
    } catch (err) {
      throw serverPageNotFoundError(err);
    }
    if (!data || !data.status || !data.html) throw serverPageNotFoundError();

    const $ = cheerio.load(data.html);

    const servers: ServerResult[] = [];

    // use for loop to use await
    const elements = $("div.item.server-item");
    for (const el of elements) {
      const name = $(el).text().trim();
      const serverNumber = Number($(el).data("server-id")) ?? -1;
      const audioType = $(el).attr("data-type") ?? "sub";
      const sourceId = Number($(el).data("id")) ?? null;
      if (!sourceId) continue;

      // oa = play_original_audio
      // autoplay and oa are not needed
      const url = `${this.NINEANIME_URL}/ajax/episode/sources?id=${sourceId}&autoPlay=${1}&oa=${0}`;

      const card: ServerResult = {
        provider: this.PROVIDER,
        name,
        serverNumber,
        url,
        audioType,
        playerUrl: await this.getPlayer(url),
      };

      if (!card.playerUrl) continue;

      servers.push(card);
    }

    return servers;
  }

  private async getPlayer(sourceUrl: string): Promise<string> {
    let data: NineAnimeSourceApiResponse;
    try {
      data = (await this.httpService.axiosRef.get(sourceUrl)).data;
    } catch (e) {
      return "";
    }

    return data?.link;
  }
}

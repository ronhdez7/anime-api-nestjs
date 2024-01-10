import { Injectable } from "@nestjs/common";
import { AnimeService } from "../anime/anime.service";
import {
  AnimeCard,
  AnimeFilterOptions,
  EpisodeCard,
  ServerCard,
} from "../anime/interfaces/anime.interface";
import * as cheerio from "cheerio";
import { ANIME_PROVIDER } from "../app.constants";
import { NineAnimeApiResponse } from "./interfaces/9anime.interface";
import {
  animePageNotFoundError,
  episodePageNotFoundError,
  serverPageNotFoundError,
} from "../anime/errors/not-found.error";
import { HttpService } from "@nestjs/axios";

@Injectable()
export class NineAnimeService implements AnimeService {
  readonly NINEANIME_URL = "https://9animetv.to";

  constructor(private readonly httpService: HttpService) {}

  async getAnime() {
    return await this.scrapeAnime("/home");
  }

  async scrapeAnime(url: string) {
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

    const animes: AnimeCard[] = [];
    $("div.film_list-wrap")
      .children()
      .each((_, el) => {
        const name = $(el).find("a.dynamic-name").attr("title") ?? null;
        const jname = $(el).find("a.dynamic-name").attr("data-jname") ?? null;
        const sub = $(el).find("div.tick-sub").text().trim() === "SUB";
        const dub = $(el).find("div.tick-dub").text().trim() === "DUB";
        const quality = $(el).find("div.tick-quality").text().trim() || null;

        let image =
          $(el).find("img.film-poster-img").attr("data-src")?.trim() ?? null;
        if (image?.startsWith("/")) {
          image = this.NINEANIME_URL + image;
        }

        let link =
          $(el).find("a.film-poster-ahref").attr("href")?.trim() ?? null;
        if (link?.startsWith("/")) {
          link = this.NINEANIME_URL + link;
        }

        const card: AnimeCard = {
          provider: ANIME_PROVIDER.NINEANIME,
          name,
          jname,
          image,
          link,
          audioType: {
            sub,
            dub,
          },
          filmType: null,
          quality,
        };

        animes.push(card);
      });

    return animes;
  }

  async filterAnime(options: AnimeFilterOptions): Promise<AnimeCard[]> {
    const keyword = options.keyword ?? "";
    const type = options.type ?? "";
    const status = options.status ?? "all";
    const season = options.season ?? "";
    const language = options.language ?? "";
    const sort = options.sort ?? "default";
    const year = options.year ?? "";
    const genre = options.genres ?? "";
    const page = options.page ?? "";

    const url = `${this.NINEANIME_URL}/filter?keyword=${keyword}&type=${type}&status=${status}&season=${season}&language=${language}&sort=${sort}&year=${year}&genre=${genre}&page=${page}`;

    return await this.scrapeAnime(url);
  }

  async getEpisodes(animeUrl: string): Promise<EpisodeCard[]> {
    const animeId = this.getIdFromUrl(animeUrl);

    if (animeId < 0) return [];

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

    const episodes: EpisodeCard[] = [];
    $("div.episodes-ul > a.item").each((_, el) => {
      const name = $(el).attr("title") ?? "";

      const number = parseInt($(el).attr("data-number") ?? "-1");

      const id = parseInt($(el).attr("data-id") ?? "-1");

      let link = $(el).attr("href")?.trim() ?? "";
      if (link?.startsWith("/")) {
        link = this.NINEANIME_URL + link;
      }

      const card: EpisodeCard = {
        provider: ANIME_PROVIDER.NINEANIME,
        name,
        number,
        // id,
        link,
      };

      episodes.push(card);
    });

    return episodes;
  }

  async getServers(episodeUrl: string): Promise<ServerCard[]> {
    const episodeId = this.getIdFromUrl(episodeUrl);
    if (episodeId < 0) return [];

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

    const servers: ServerCard[] = [];
    $("div.item.server-item").each((_, el) => {
      const name = $(el).text().trim();
      const id = parseInt($(el).attr("data-server-id") ?? "-1");
      const sourceId = parseInt($(el).attr("data-id") ?? "-1");
      const link = `${this.NINEANIME_URL}/ajax/episode/sources?id=${sourceId}`;

      const type = $(el).attr("data-type") ?? "sub";

      const card: ServerCard = {
        provider: ANIME_PROVIDER.NINEANIME,
        name,
        id,
        link,
        type,
      };

      servers.push(card);
    });

    return servers;
  }

  private getIdFromUrl(url: string): number {
    const id = parseInt(url.slice(url.search(/(?<=(-|=))\d+$/)) ?? "") ?? -1;

    return id;
  }
}

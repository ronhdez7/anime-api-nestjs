import { Injectable } from "@nestjs/common";
import { AnimeService } from "src/anime/anime.service";
import {
  AnimeResult,
  AnimeFilterOptions,
  EpisodeResult,
  ServerResult,
  AnimeProvider,
  GenreResult,
} from "src/anime/interfaces/anime.interface";
import {
  AnicrushAnimeResult,
  AnicrushApiResponse,
  AnicrushEpisodeGuide,
  AnicrushGenreResult,
  AnicrushServerGuide,
  AnicrushSourceResult,
} from "./interfaces/anicrush.interface";
import {
  animePageNotFoundError,
  episodePageNotFoundError,
  serverPageNotFoundError,
} from "src/anime/errors/not-found.error";
import { HttpService } from "@nestjs/axios";
import { ObjectKeys } from "src/interfaces/helpers.types";
import { ApiException } from "src/errors/http.exception";

@Injectable()
export class AnicrushService implements AnimeService {
  readonly PROVIDER: AnimeProvider = "ANICRUSH";

  readonly ANICRUSH_BASE_URL = "https://anicrush.to";
  readonly ANICRUSH_API_URL = "https://api.anicrush.to";
  readonly BASE_IMAGE_PATH =
    "https://static.gniyonna.com/media/poster/300x400/100";
  private readonly DEFAULT_HEADERS = { "x-site": "anicrush" };

  constructor(private readonly httpService: HttpService) {}

  async getGenres(): Promise<GenreResult[]> {
    let data: AnicrushApiResponse<AnicrushGenreResult[]>;
    try {
      data = (
        await this.httpService.axiosRef.get(
          `${this.ANICRUSH_API_URL}/shared/v1/genre/all`,
          {
            headers: { ...this.DEFAULT_HEADERS },
          },
        )
      ).data;
      if (!data || !data.status) throw new Error("Not found");
    } catch (err) {
      throw animePageNotFoundError(err);
    }

    return data.result.map((genre) => ({
      title: genre.name,
      url: `/genre/${genre.slug}`,
    }));
  }

  async getAnimeByGenre(genre: string): Promise<AnimeResult[]> {
    return await this.scrapeAnime(
      `${this.ANICRUSH_API_URL}/shared/v1/genre/detail/${genre}`,
    );
  }

  async getAnime(): Promise<AnimeResult[]> {
    const trendingUrl = `${this.ANICRUSH_API_URL}/shared/v2/movie/trending`;

    return await this.scrapeAnime(trendingUrl);
  }

  async scrapeAnime(url: string): Promise<AnimeResult[]> {
    if (url.startsWith("/")) {
      url = this.ANICRUSH_API_URL + url;
    }

    let data: AnicrushApiResponse<AnicrushAnimeResult[]>;
    try {
      data = (
        await this.httpService.axiosRef.get(url, {
          headers: { ...this.DEFAULT_HEADERS },
        })
      ).data;
    } catch (err) {
      throw animePageNotFoundError(err);
    }
    if (!data.status) throw animePageNotFoundError(data);

    let items: AnicrushAnimeResult[];
    if ("movies" in data.result) {
      items = data.result.movies as any;
    } else if ("data" in data.result) {
      items = (data.result.data as any).movies;
    } else {
      items = data.result;
    }
    const animes: AnimeResult[] = [];

    for (const anime of items) {
      // extract image
      let imagePath = "";
      for (let i = anime.poster_path.length - 1; i > -1; i--) {
        const c = anime.poster_path[i];
        if (c === "/") break;
        else imagePath = c + imagePath;
      }
      const [imgId, ext] = imagePath.split(".");
      const image = `${this.BASE_IMAGE_PATH}/${imgId
        ?.split("")
        .reverse()
        .join("")}.${ext}`;

      const url = `${this.ANICRUSH_BASE_URL}/watch/${anime.slug}.${anime.id}`;
      let episodeCount = anime.total_episodes;
      if (episodeCount <= 0) {
        episodeCount = anime.latest_episode_sub ?? episodeCount;
      }

      const card: AnimeResult = {
        provider: this.PROVIDER,
        name: anime.name_english,
        jname: anime.name,
        audioType: {
          sub: anime.latest_episode_sub > 0,
          dub: anime.latest_episode_dub > 0,
        },
        image,
        url,
        quality: null,
        filmType: anime.type.toUpperCase() as any,
        episodeCount,
      };

      animes.push(card);
    }

    return animes;
  }

  async filterAnime(
    options: AnimeFilterOptions | string,
  ): Promise<AnimeResult[]> {
    let url = `${this.ANICRUSH_API_URL}/shared/v2/movie/list?`;
    if (typeof options === "string") {
      url += options;
    } else {
      url += "";
    }

    return this.scrapeAnime(url);
  }

  async getEpisodes(animeUrl: string): Promise<EpisodeResult[]> {
    const animeId = new URL(animeUrl).pathname.split(".").at(-1);
    if (!animeId || animeId.length > 6) {
      throw new ApiException("Could not get anime id", 400, {
        description: "Anime id must be provided at end `/slug.<id>`",
      });
    }

    let data: AnicrushApiResponse<AnicrushEpisodeGuide>;
    try {
      data = (
        await this.httpService.axiosRef.get(
          `${this.ANICRUSH_API_URL}/shared/v2/episode/list?_movieId=${animeId}`,
          { headers: { ...this.DEFAULT_HEADERS } },
        )
      ).data;
    } catch (err) {
      throw episodePageNotFoundError(err);
    }
    if (!data.status) throw episodePageNotFoundError();

    const episodes: EpisodeResult[] = [];

    for (const range in data.result) {
      for (const episode of data.result[range]!) {
        const card: EpisodeResult = {
          provider: this.PROVIDER,
          providerId: episode.id,
          name: episode.name_english,
          jname: episode.name,
          url: `${animeUrl}?ep=${episode.number}`,
          number: episode.number,
        };

        episodes.push(card);
      }
    }

    return episodes;
  }

  async getServers(episodeUrl: string): Promise<ServerResult[]> {
    const animeId = new URL(episodeUrl).pathname.split(".").at(-1);
    const episodeNumber =
      Number(new URL(episodeUrl).searchParams.get("ep")) ?? -1;
    if (!animeId || animeId.length > 6 || !episodeNumber || episodeNumber < 0) {
      throw new ApiException("Could not get anime id or episode number", 400, {
        description: "Url must be `/slug.<id>?ep=<number>`",
      });
    }

    let data: AnicrushApiResponse<AnicrushServerGuide>;
    try {
      data = (
        await this.httpService.axiosRef.get(
          `${this.ANICRUSH_API_URL}/shared/v2/episode/servers?_movieId=${animeId}&ep=${episodeNumber}`,
          { headers: { ...this.DEFAULT_HEADERS } },
        )
      ).data;
    } catch (err) {
      throw serverPageNotFoundError(err);
    }
    if (!data.status) throw serverPageNotFoundError();

    const keys = Object.keys(data.result) as ObjectKeys<typeof data.result>[];
    const servers: ServerResult[] = (
      await Promise.all(
        keys.flatMap((audioType) => {
          if (!data.status) return;
          return data.result[audioType].map(async (server) => {
            const url = `${this.ANICRUSH_API_URL}/shared/v2/episode/sources?_movieId=${animeId}&ep=${episodeNumber}&sv=${server.server}&sc=${audioType}`;

            const card: ServerResult = {
              provider: this.PROVIDER,
              serverNumber: server.server,
              name: server.streamServer.name,
              url,
              audioType,
              playerUrl: await this.getPlayer(url),
            };

            if (!card.playerUrl) return;

            return card;
          });
        }),
      )
    ).filter((s) => s) as any;

    return servers;
  }

  private async getPlayer(sourceUrl: string): Promise<string> {
    let data: AnicrushApiResponse<AnicrushSourceResult>;
    try {
      data = (
        await this.httpService.axiosRef.get(sourceUrl, {
          headers: { ...this.DEFAULT_HEADERS },
        })
      ).data;
    } catch (e) {
      // throw sourceNotFoundError(e);
      return "";
    }

    if (!data || !data.status) {
      // throw sourceNotFoundError();
      return "";
    }

    return data.result.link;
  }
}

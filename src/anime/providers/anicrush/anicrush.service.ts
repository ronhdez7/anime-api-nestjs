import { Injectable } from "@nestjs/common";
import { AnimeService } from "src/anime/anime.service";
import {
  AnimeCard,
  AnimeFilterOptions,
  EpisodeCard,
  ObjectKeys,
  PlayerCard,
  ServerCard,
  SourceCard,
} from "src/anime/interfaces/anime.interface";
import {
  AnicrushAnimeCard,
  AnicrushApiResponse,
  AnicrushEpisodeGuide,
  AnicrushServerGuide,
  AnicrushSourceCard,
} from "./interfaces/anicrush.interface";
import { ANIME_PROVIDER } from "src/anime/anime.constants";
import {
  animePageNotFoundError,
  episodePageNotFoundError,
  serverPageNotFoundError,
  sourceNotFoundError,
} from "src/anime/errors/not-found.error";
import { HttpService } from "@nestjs/axios";
import { getVideoSource } from "../shared/get-video-source";

@Injectable()
export class AnicrushService implements AnimeService {
  readonly ANICRUSH_BASE_URL = "https://anicrush.to";
  readonly ANICRUSH_API_URL = "https://api.anicrush.to";
  readonly BASE_IMAGE_PATH =
    "https://static.gniyonna.com/media/poster/300x400/100/";
  private readonly DEFAULT_HEADERS = { "x-site": "anicrush" };

  constructor(private readonly httpService: HttpService) {}

  async getAnime(): Promise<AnimeCard[]> {
    const trendingUrl = `${this.ANICRUSH_API_URL}/shared/v2/movie/trending`;

    return await this.scrapeAnime(trendingUrl);
  }

  async scrapeAnime(url: string): Promise<AnimeCard[]> {
    if (url.startsWith("/")) {
      url = this.ANICRUSH_API_URL + url;
    }

    let data: AnicrushApiResponse<AnicrushAnimeCard[]>;
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

    const animes: AnimeCard[] = [];

    const items: AnicrushAnimeCard[] =
      "movies" in data.result ? (data.result.movies as any) : data.result;

    for (const anime of items) {
      let imagePath = "";
      for (let i = anime.poster_path.length - 1; i > -1; i--) {
        const c = anime.poster_path[i];
        if (c === "/") break;
        else imagePath = c + imagePath;
      }
      const [imgId, ext] = imagePath.split(".");
      const image = `${this.BASE_IMAGE_PATH}${imgId
        ?.split("")
        .reverse()
        .join("")}.${ext}`;

      const link = `${this.ANICRUSH_BASE_URL}/watch/${anime.slug}.${anime.id}`;

      const filmType = anime.type;

      const card: AnimeCard = {
        provider: ANIME_PROVIDER.ANICRUSH,
        name: anime.name_english,
        jname: anime.name,
        audioType: {
          sub: anime.latest_episode_sub > 0,
          dub: anime.latest_episode_dub > 0,
        },
        image,
        link,
        quality: null,
        filmType,
      };

      animes.push(card);
    }

    return animes;
  }

  async filterAnime(
    options: AnimeFilterOptions | string,
  ): Promise<AnimeCard[]> {
    let url = `${this.ANICRUSH_API_URL}/shared/v2/movie/list?`;
    if (typeof options === "string") {
      url += options;
    } else {
      url += "";
    }

    return this.scrapeAnime(url);
  }

  async getEpisodes(animeUrl: string): Promise<EpisodeCard[]> {
    const animeId = this.getIdFromUrl(animeUrl);
    if (!animeId) return [];

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

    const episodes: EpisodeCard[] = [];

    for (const range in data.result) {
      for (const episode of data.result[range]!) {
        const card: EpisodeCard = {
          provider: ANIME_PROVIDER.ANICRUSH,
          name: episode.name,
          link: `${animeUrl}?ep=${episode.number}`,
          number: episode.number,
        };

        episodes.push(card);
      }
    }

    return episodes;
  }

  async getServers(episodeUrl: string): Promise<ServerCard[]> {
    const animeId = this.getIdFromUrl(episodeUrl);
    const episodeNumber =
      parseInt(episodeUrl.slice(episodeUrl.search(/(?<=ep\=)\d+$/))) ?? -1;
    if (!animeId || episodeNumber < 0) return [];

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

    const servers: ServerCard[] = [];
    const keys = Object.keys(data.result) as ObjectKeys<typeof data.result>[];
    for (const audioType of keys) {
      for (const server of data.result[audioType]) {
        const card: ServerCard = {
          provider: ANIME_PROVIDER.ANICRUSH,
          id: server.server,
          name: server.streamServer.name,
          link: `${this.ANICRUSH_API_URL}/shared/v2/episode/sources?_movieId=${animeId}&ep=${episodeNumber}&sv=${server.server}&sc=${audioType}`,
          type: audioType,
          player: await this.getPlayer(
            server.server,
            audioType,
            animeId,
            episodeNumber,
          ),
        };

        servers.push(card);
      }
    }

    return servers;
  }

  async getSources(playerUrl: string): Promise<SourceCard> {
    return await getVideoSource(this.httpService, playerUrl);
  }

  private async getPlayer(
    serverId: number,
    type: string,
    animeId: string,
    episodeNumber: number,
  ): Promise<PlayerCard> {
    let data: AnicrushApiResponse<AnicrushSourceCard>;
    try {
      data = (
        await this.httpService.axiosRef.get(
          `${this.ANICRUSH_API_URL}/shared/v2/episode/sources?_movieId=${animeId}&ep=${episodeNumber}&sv=${serverId}&sc=${type}`,
          { headers: { ...this.DEFAULT_HEADERS } },
        )
      ).data;
    } catch (e) {
      throw sourceNotFoundError(e);
    }

    if (!data || !data.status) throw sourceNotFoundError();

    const card = {
      link: data.result.link,
    };

    return card;
  }

  private getIdFromUrl(url: string) {
    const id = (url.match(/(?<=watch\/.+\.).+?(?=\?|$)/) ?? [])[0] ?? "";
    return id;
  }
}

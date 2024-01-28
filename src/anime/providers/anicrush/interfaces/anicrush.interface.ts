import { AnimeFilmType } from "src/anime/interfaces/anime.interface";

export type AnicrushApiResponse<T = any> =
  | {
      status: true;
      result: T;
    }
  | {
      status: false;
      message: string;
    };

export interface AnicrushGenreResult {
  id: number;
  name: string;
  slug: string;
}

export interface AnicrushAnimeResult {
  airing_status: number;
  country_code: string;
  genres: AnicrushGenreResult[];
  id: string;
  id_number: number;
  latest_episode_dub: number;
  latest_episode_sub: number;
  name: string;
  name_english: string;
  poster_path: string;
  rating_type: string;
  runtime: number;
  slug: string;
  total_episodes: number;
  type: AnimeFilmType;
}

export interface AnicrushEpisodeResult {
  id: number;
  is_filler: number;
  name: string;
  name_english: string;
  number: number;
}
export type AnicrushEpisodeGuide = Record<string, AnicrushEpisodeResult[]>;

interface AnicrushStreamServer {
  name: string;
  type: string;
  url: string | null;
}
export interface AnicrushServerResult {
  hard_sub: number;
  multiple_audio: number;
  server: number;
  streamServer: AnicrushStreamServer;
  type: number;
}
export type AnicrushServerGuide = Record<"sub" | "dub", AnicrushServerResult[]>;

export interface AnicrushSourceResult {
  type: string;
  link: string;
  server: number;
}

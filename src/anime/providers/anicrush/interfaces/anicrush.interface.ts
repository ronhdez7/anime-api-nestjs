export type AnicrushApiResponse<T = any> =
  | {
      status: true;
      result: T;
    }
  | {
      status: false;
      message: string;
    };

export interface AnicrushGenreCard {
  id: number;
  name: string;
  slug: string;
}

export interface AnicrushAnimeCard {
  airing_status: number;
  country_code: string;
  genres: AnicrushGenreCard[];
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
  type: string;
}

export interface AnicrushEpisodeCard {
  id: number;
  is_filler: number;
  name: string;
  name_english: string;
  number: number;
}
export type AnicrushEpisodeGuide = Record<string, AnicrushEpisodeCard[]>;

interface AnicrushStreamServer {
  name: string;
  type: string;
  url: string | null;
}
export interface AnicrushServerCard {
  hard_sub: number;
  multiple_audio: number;
  server: number;
  streamServer: AnicrushStreamServer;
  type: number;
}
export type AnicrushServerGuide = Record<"sub" | "dub", AnicrushServerCard[]>;

export interface AnicrushSourceCard {
  type: string;
  link: string;
  server: number;
}

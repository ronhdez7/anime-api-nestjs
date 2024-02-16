import { Type } from "@nestjs/common";
import { ANIME_PROVIDER, genres } from "src/anime/anime.constants";
import { AnimeService } from "../anime.service";
import { ObjectValues } from "src/interfaces/helpers.types";

export interface GenreResult {
  url: string;
  title: string;
}
export type Genre = Uppercase<(typeof genres)[number]["title"]>;

export type AnimeProvider = ObjectValues<typeof ANIME_PROVIDER>;
export type AnimeFilmType =
  | "MOVIE"
  | "TV"
  | "OVA"
  | "ONA"
  | "SPECIAL"
  | "MUSIC";

export interface AnimeResult {
  provider: AnimeProvider;
  name: string | null;
  jname: string | null;
  audioType: {
    sub: boolean;
    dub: boolean;
  };
  filmType: AnimeFilmType | null;
  url: string;
  image: string | null;
  quality: string | null;
  episodeCount: number | null;
}

/**
 * Not used right now.
 * Replaced by string options.
 */
export interface AnimeFilterOptions {
  keyword?: string;
  type?: string[]; // number[]
  status?: string; // number
  season?: string[]; // number[]
  language?: string[]; // (sub | dub)[]
  sort?: string;
  year?: number[];
  genres?: string[]; // number[]
  page?: number;
}

export interface EpisodeResult {
  provider: AnimeProvider;
  providerId: number;
  name: string | null;
  jname: string | null;
  number: number;
  url: string | null;
}

export interface ServerResult {
  provider: AnimeProvider;
  name: string;
  serverNumber: number;
  url: string;
  audioType: string;
  playerUrl: string;
}

export interface SourceTrack {
  file: string;
  kind: string;
  label?: string;
  default?: true;
}

export interface AnimeSectionTimestamps {
  start: number;
  end: number;
}

export interface Source {
  url: string;
  type: string;
}

export interface SourceResult {
  sources: Source[];
  tracks: SourceTrack[];
  intro: AnimeSectionTimestamps;
  outro: AnimeSectionTimestamps;
  playerUrls: string[];
  duration: number;
  thumbnail: string | null;
}

export interface EncryptedSourceResult {
  file: string;
  type: string;
}

export interface AnimeProviderDetails {
  type: AnimeProvider;
  baseUrl: string;
  service: Type<AnimeService>;
}

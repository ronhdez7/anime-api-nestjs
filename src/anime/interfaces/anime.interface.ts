import { Type } from "@nestjs/common";
import { ANIME_PROVIDER } from "src/anime/anime.constants";
import { AnimeService } from "../anime.service";

export type ObjectKeys<T> = keyof T;
export type ObjectValues<T> = T[keyof T];

export type AnimeProvider = ObjectValues<typeof ANIME_PROVIDER>;
export type AnimeFilmType = "movie" | "show";

export interface AnimeCard {
  provider: AnimeProvider;
  name: string | null;
  jname: string | null;
  audioType: {
    sub: boolean;
    dub: boolean;
  };
  filmType: AnimeFilmType | null;
  link: string | null;
  image: string | null;
  quality: string | null;
}

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

export interface EpisodeCard {
  provider: AnimeProvider;
  name: string | null;
  number: number;
  link: string;
}

export interface ServerCard {
  provider: AnimeProvider;
  name: string;
  id: number;
  // sourceId: number;
  link: string | null;
  type: string;
}

export interface AnimeSourceApiResponse {
  type: string;
  link: string;
  server: number;
  // not needed
  sources: any[];
  tracks: any[];
  htmlGuide: string;
}

export interface AnimeProviderDetails {
  type: AnimeProvider;
  baseUrl: string;
  service: Type<AnimeService>;
}

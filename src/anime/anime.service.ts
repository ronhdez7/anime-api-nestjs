import { Injectable } from "@nestjs/common";
import {
  AnimeResult,
  AnimeFilterOptions,
  EpisodeResult,
  ServerResult,
  AnimeProvider,
  GenreResult,
  Genre,
} from "./interfaces/anime.interface";

@Injectable()
export abstract class AnimeService {
  abstract readonly PROVIDER: AnimeProvider;

  /**
   * Gets genres from each provider
   * Use '/all/genres' for genres usable with any provider
   * @returns A list of objects with url and title of the genre
   */
  abstract getGenres(): Promise<GenreResult[]>;

  abstract getAnimeByGenre(genre: Genre): Promise<AnimeResult[]>;
  abstract getAnimeByGenre(genre: string): Promise<AnimeResult[]>;

  /**
   * Gets some anime recommendations
   * @returns A list of anime shown in the homepage
   */
  abstract getAnime(): Promise<AnimeResult[]>;
  /**
   * Generic function used to scrape list of anime
   * @retuns A list of anime scraped from the page
   * @param url The url of the page to scrape from
   */
  abstract scrapeAnime(url: string): Promise<AnimeResult[]>;
  /**
   * WARNING: It will work correctly, but it is not fully implemented, yet
   * @returns A list of anime that were filtered
   * @param options Used for filtering. If string is provided, no modifications will be done to it
   */
  abstract filterAnime(
    options: AnimeFilterOptions | string,
  ): Promise<AnimeResult[]>;

  /**
   * @returns The episodes of an anime
   * @param animeUrl The url of the anime
   */
  abstract getEpisodes(animeUrl: string): Promise<EpisodeResult[]>;

  /**
   * @returns The servers that are available to show an episode
   * @param episodeUrl The url of the episode
   */
  abstract getServers(episodeUrl: string): Promise<ServerResult[]>;
}

import { Injectable } from "@nestjs/common";
import {
  AnimeCard,
  AnimeFilterOptions,
  EpisodeCard,
  ServerCard,
} from "./interfaces/anime.interface";

@Injectable()
export abstract class AnimeStreamingService {
  // extract anime
  abstract getAnime(): Promise<AnimeCard[]>;
  abstract scrapeAnime(url: string): Promise<AnimeCard[]>;
  abstract filterAnime(
    options: AnimeFilterOptions | string,
  ): Promise<AnimeCard[]>;

  // get episodes
  abstract getEpisodes(animeUrl: string): Promise<EpisodeCard[]>;

  // get servers
  abstract getServers(episodeUrl: string): Promise<ServerCard[]>;
}

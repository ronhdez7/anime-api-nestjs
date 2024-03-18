import { Injectable } from "@nestjs/common";
import { AnimeService } from "../anime.service";
import { AnimeProvider } from "../interfaces/anime.interface";
import { Redirection } from "src/utils/http-redirection";
import { ANIME_PROVIDER_DETAILS } from "../anime.constants";
import { ApiException } from "src/errors/http.exception";

type ConvertToRouterType<T> = {
  [K in keyof T]: T[K] extends (...a: infer P) => any
    ? (...a: P) => Redirection
    : T[K];
};

@Injectable()
export class RouterService implements ConvertToRouterType<AnimeService> {
  readonly PROVIDER: AnimeProvider = "9ANIME";

  getGenres(): Redirection {
    return new Redirection(`/${this.PROVIDER.toLowerCase()}/genres`);
  }

  getAnimeByGenre(genre: string): Redirection {
    return new Redirection(`/${this.PROVIDER.toLowerCase()}/genre/${genre}`);
  }

  getAnime(): Redirection {
    return new Redirection(`/${this.PROVIDER.toLowerCase()}`);
  }

  scrapeAnime(url: string): Redirection {
    const provider = this.getProviderFromUrl(url);

    return new Redirection(`/${provider.toLowerCase()}/scrape?url=${url}`);
  }

  filterAnime(options: string): Redirection {
    return new Redirection(`/${this.PROVIDER.toLowerCase()}/filter?${options}`);
  }

  getEpisodes(animeUrl: string): Redirection {
    const provider = this.getProviderFromUrl(animeUrl);

    return new Redirection(
      `/${provider.toLowerCase()}/episodes?url=${animeUrl}`,
    );
  }

  getServers(episodeUrl: string): Redirection {
    const provider = this.getProviderFromUrl(episodeUrl);

    return new Redirection(
      `/${provider.toLowerCase()}/servers?url=${episodeUrl}`,
    );
  }

  private getProviderFromUrl(url: string): AnimeProvider {
    const { origin } = new URL(url);

    const names = Object.keys(ANIME_PROVIDER_DETAILS) as AnimeProvider[];
    for (const name of names) {
      if (origin.includes(ANIME_PROVIDER_DETAILS[name].baseUrl.toLowerCase()))
        return name;
    }

    throw new ApiException("Invalid url", 400, {
      description: "Provider in url is not supported",
    });
  }
}

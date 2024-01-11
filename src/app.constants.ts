import { NineAnimeService } from "./9anime/9anime.service";
import { AnicrushService } from "./anicrush/anicrush.service";
import {
  AnimeProvider,
  AnimeProviderDetails,
} from "./anime/interfaces/anime.interface";
import { GogoanimeService } from "./gogoanime/gogoanime.service";

export const ANIME_SERVICE = Symbol("ANIME_SERVICE");

export const ANIME_PROVIDER = {
  NINEANIME: "9ANIME",
  GOGOANIME: "GOGOANIME",
  ANICRUSH: "ANICRUSH",
} as const;

export const ANIME_PROVIDER_DETAILS: Record<
  AnimeProvider,
  AnimeProviderDetails
> = {
  "9ANIME": {
    type: "9ANIME",
    baseUrl: "https://9animetv.to",
    service: NineAnimeService,
  },
  GOGOANIME: {
    type: "GOGOANIME",
    baseUrl: "https://anitaku.to",
    service: GogoanimeService,
  },
  ANICRUSH: {
    type: "ANICRUSH",
    baseUrl: "https://anicrush.to",
    service: AnicrushService,
  },
} as const;

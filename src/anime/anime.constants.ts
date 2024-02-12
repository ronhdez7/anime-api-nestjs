import { NineAnimeService } from "./providers/9anime/9anime.service";
import { AnicrushService } from "./providers/anicrush/anicrush.service";
import {
  AnimeProvider,
  AnimeProviderDetails,
} from "./interfaces/anime.interface";
import { GogoanimeService } from "./providers/gogoanime/gogoanime.service";

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

export const genres = [
  { url: "/genre/action", title: "Action" },
  { url: "/genre/adventure", title: "Adventure" },
  { url: "/genre/cars", title: "Cars" },
  { url: "/genre/comedy", title: "Comedy" },
  { url: "/genre/dementia", title: "Dementia" },
  { url: "/genre/demons", title: "Demons" },
  { url: "/genre/drama", title: "Drama" },
  { url: "/genre/ecchi", title: "Ecchi" },
  { url: "/genre/fantasy", title: "Fantasy" },
  { url: "/genre/game", title: "Game" },
  { url: "/genre/harem", title: "Harem" },
  { url: "/genre/historical", title: "Historical" },
  { url: "/genre/horror", title: "Horror" },
  { url: "/genre/isekai", title: "Isekai" },
  { url: "/genre/josei", title: "Josei" },
  { url: "/genre/kids", title: "Kids" },
  { url: "/genre/magic", title: "Magic" },
  { url: "/genre/marial-arts", title: "Martial Arts" },
  { url: "/genre/mecha", title: "Mecha" },
  { url: "/genre/military", title: "Military" },
  { url: "/genre/music", title: "Music" },
  { url: "/genre/mystery", title: "Mystery" },
  { url: "/genre/parody", title: "Parody" },
  { url: "/genre/police", title: "Police" },
  { url: "/genre/psychological", title: "Psychological" },
  { url: "/genre/romance", title: "Romance" },
  { url: "/genre/samurai", title: "Samurai" },
  { url: "/genre/school", title: "School" },
  { url: "/genre/sci-fi", title: "Sci-Fi" },
  { url: "/genre/seinen", title: "Seinen" },
  { url: "/genre/shoujo", title: "Shoujo" },
  { url: "/genre/shoujo-ai", title: "Shoujo Ai" },
  { url: "/genre/shounen", title: "Shounen" },
  { url: "/genre/shounen-ai", title: "Shounen Ai" },
  { url: "/genre/slice-of-life", title: "Slice of Life" },
  { url: "/genre/space", title: "Space" },
  { url: "/genre/sports", title: "Sports" },
  { url: "/genre/super-power", title: "Super Power" },
  { url: "/genre/supernatural", title: "Supernatural" },
  { url: "/genre/thriller", title: "Thriller" },
  { url: "/genre/vampire", title: "Vampire" },
];

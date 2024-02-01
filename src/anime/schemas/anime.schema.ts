// Generated by ts-to-zod
import { z } from "zod";
import {
  AnimeFilmType,
  AnimeFilterOptions,
  AnimeProvider,
  AnimeResult,
  AnimeSectionTimestamps,
  EpisodeResult,
  ServerResult,
  Source,
  SourceResult,
  SourceTrack,
} from "../interfaces/anime.interface";

export const animeProviderSchema: z.ZodType<AnimeProvider> = z.union([
  z.literal("9ANIME"),
  z.literal("GOGOANIME"),
  z.literal("ANICRUSH"),
]);

export const animeFilmTypeSchema: z.ZodType<AnimeFilmType> = z.union([
  z.literal("MOVIE"),
  z.literal("TV"),
  z.literal("OVA"),
  z.literal("ONA"),
  z.literal("SPECIAL"),
  z.literal("MUSIC"),
]);

export const animeSchema: z.ZodType<AnimeResult> = z.object({
  provider: animeProviderSchema,
  name: z.string().nullable(),
  jname: z.string().nullable(),
  audioType: z.object({
    sub: z.boolean(),
    dub: z.boolean(),
  }),
  filmType: animeFilmTypeSchema.nullable(),
  url: z.string(),
  image: z.string().nullable(),
  quality: z.string().nullable(),
  episodeCount: z.number().nullable(),
});
export const animeResultSchema: z.ZodType<AnimeResult[]> = z.array(animeSchema);

export const animeFilterOptionsSchema: z.ZodType<AnimeFilterOptions> = z.object(
  {
    keyword: z.string().optional(),
    type: z.array(z.string()).optional(),
    status: z.string().optional(),
    season: z.array(z.string()).optional(),
    language: z.array(z.string()).optional(),
    sort: z.string().optional(),
    year: z.array(z.number()).optional(),
    genres: z.array(z.string()).optional(),
    page: z.number().optional(),
  },
);

export const episodeSchema: z.ZodType<EpisodeResult> = z.object({
  provider: animeProviderSchema,
  providerId: z.number(),
  name: z.string().nullable(),
  jname: z.string().nullable(),
  number: z.number(),
  url: z.string().nullable(),
});
export const episodeResultSchema: z.ZodType<EpisodeResult[]> =
  z.array(episodeSchema);

export const serverSchema: z.ZodType<ServerResult> = z.object({
  provider: animeProviderSchema,
  name: z.string(),
  serverNumber: z.number(),
  url: z.string(),
  audioType: z.string(),
  playerUrl: z.string(),
});
export const serverResultSchema: z.ZodType<ServerResult[]> =
  z.array(serverSchema);

export const sourceTrackSchema: z.ZodType<SourceTrack> = z.object({
  file: z.string(),
  kind: z.string(),
  label: z.string().optional(),
  default: z.literal(true).optional(),
});

export const animeSectionTimestampsSchema: z.ZodType<AnimeSectionTimestamps> =
  z.object({
    start: z.number(),
    end: z.number(),
  });

export const encryptedSourceResultSchema: z.ZodType<Source> = z.object({
  url: z.string(),
  type: z.string(),
});

export const sourceResultSchema: z.ZodType<SourceResult> = z.object({
  sources: z.array(encryptedSourceResultSchema),
  tracks: z.array(sourceTrackSchema),
  intro: animeSectionTimestampsSchema,
  outro: animeSectionTimestampsSchema,
  server: z.number(),
  playerUrl: z.string(),
});

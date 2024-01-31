import { SourceTrack } from "src/anime/interfaces/anime.interface";

interface GogoanimeSource {
  file: string;
  label: string;
  type: string;
}

// interface GogoanimeSourceTrack {
//   file: string;
//   kind: string;
// }

export interface GogoanimeSourceResult {
  source: GogoanimeSource[];
  source_bk: GogoanimeSource[];
  track: { tracks: SourceTrack[] };
  advertising: any[];
  linkiframe: string;
}

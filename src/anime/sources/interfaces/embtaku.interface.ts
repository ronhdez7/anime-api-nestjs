import { SourceTrack } from "src/anime/interfaces/anime.interface";

interface EmbtakuSource {
  file: string;
  label: string;
  type: string;
}

// interface EmbtakuSourceTrack {
//   file: string;
//   kind: string;
// }

export interface EmbtakuSourceResult {
  source: EmbtakuSource[];
  source_bk: EmbtakuSource[];
  track: { tracks?: SourceTrack[] };
  advertising: any[];
  linkiframe: string;
}

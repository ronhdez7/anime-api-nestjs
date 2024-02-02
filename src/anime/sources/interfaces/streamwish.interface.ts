import {
  EncryptedSourceResult,
  SourceTrack,
} from "src/anime/interfaces/anime.interface";

export interface StreamwishPlayerSetup {
  sources: Pick<EncryptedSourceResult, "file">[];
  tracks: SourceTrack[];
  title: string;
  image: string;
  duration: string;
}

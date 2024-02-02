import { SourceResult } from "src/anime/interfaces/anime.interface";
import { SourceName } from "./interfaces/source.interface";

export abstract class SourceServiceGateway {
  readonly SOURCE_NAME: SourceName;

  abstract getSources(playerUrl: string): Promise<SourceResult>;
}

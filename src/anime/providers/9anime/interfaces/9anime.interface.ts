export interface NineAnimeApiResponse {
  status: boolean;
  html: string;
}

export interface NineAnimeSourceApiResponse {
  type: string;
  link: string;
  server: number;
  // not needed
  sources: any[];
  tracks: any[];
  htmlGuide: string;
}

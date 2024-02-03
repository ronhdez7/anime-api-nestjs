import { HttpService } from "@nestjs/axios";
import {
  AnimeSectionTimestamps,
  EncryptedSourceResult,
  SourceResult,
  SourceTrack,
} from "src/anime/interfaces/anime.interface";
import { ApiException } from "src/errors/http.exception";
import { ObjectKeys } from "src/interfaces/helpers.types";
import { decrypt } from "./cypher";

interface SourceResponse {
  sources: string | EncryptedSourceResult[];
  encrypted: boolean;
  tracks: SourceTrack[];
  intro: AnimeSectionTimestamps;
  outro: AnimeSectionTimestamps;
  server: number;
}

const URLS = {
  RAPIDCLOUD: {
    GET_SCRIPT: "https://rapid-cloud.co/js/player/prod/e6-player-v2.min.js?v=",
    GET_SOURCES: "https://rapid-cloud.co/ajax/embed-6-v2/getSources?id=",
  },
  SOUTHCLOUD: {
    GET_SCRIPT: "https://southcloud.tv/js/player/a/sc/prod/p1.min.js?v=",
    GET_SOURCES: "https://southcloud.tv/e/ajax/p-1/getSources?id=",
  },
  MEGACLOUD: {
    GET_SCRIPT:
      "https://megacloud.tv/js/player/a/prod/e1-player.min.js?v=1706937092",
    GET_SOURCES: "https://megacloud.tv/embed-2/ajax/e-1/getSources?id=",
  },
} as const;

export async function getVideoSource(
  httpService: HttpService,
  playerUrl: string,
): Promise<SourceResult> {
  // extract video id from url
  const videoId = new URL(playerUrl).pathname.split("/").at(-1);
  if (!videoId) {
    throw new ApiException("Url provided doesn't contain a video id", 400, {
      description: "Video id should be last path parameter",
    });
  }

  // get correct urls based on player provider
  let playerSource: ObjectKeys<typeof URLS> = "RAPIDCLOUD";
  if (playerUrl.includes("southcloud")) playerSource = "SOUTHCLOUD";
  else if (playerUrl.includes("rapid-cloud")) playerSource = "RAPIDCLOUD";
  else if (playerUrl.includes("megacloud")) playerSource = "MEGACLOUD";

  const urls = URLS[playerSource];

  // grab encrypted string
  let sourceResponse: SourceResponse;
  try {
    sourceResponse = (
      await httpService.axiosRef.get(urls.GET_SOURCES.concat(videoId))
    ).data;
    if (!sourceResponse) throw new Error("No response");
  } catch (err) {
    throw new ApiException("Internal request failed", 404, {
      cause: err,
      description: "Check url has a valid video id",
    });
  }
  // if source is not encrypted, then I am done
  const encryptedString = sourceResponse.sources;
  if (Array.isArray(encryptedString)) {
    return {
      sources: encryptedString.map((s) => ({ url: s.file, type: s.type })),
      tracks: sourceResponse.tracks,
      intro: sourceResponse.intro,
      outro: sourceResponse.outro,
      playerUrls: [playerUrl],
      duration: -1,
      thumbnail: null,
    };
  }

  // get script
  const scriptUrl = urls.GET_SCRIPT.concat(Date.now().toString());
  let text: string;
  try {
    text = (await httpService.axiosRef.get(scriptUrl)).data;
  } catch (err) {
    throw new ApiException("Internal server error", 500, {
      cause: err,
      description: "Failed to get script to decrypt source",
    });
  }

  const vars = extractVariables(text, playerSource);

  try {
    const { secret, encryptedSource } = getSecret(encryptedString, vars);

    const decrypted = decrypt(encryptedSource, secret);

    const sources: EncryptedSourceResult[] = JSON.parse(decrypted);

    // return a formatted source
    return {
      sources: sources.map((s) => ({ url: s.file, type: s.type })),
      tracks: sourceResponse.tracks,
      intro: sourceResponse.intro,
      outro: sourceResponse.outro,
      playerUrls: [playerUrl],
      duration: -1,
      thumbnail: null,
    };
  } catch (err) {
    console.log(err);
    throw new ApiException("Internal Server Error", 500, {
      cause: err,
      description: "Failed to decrypt source",
    });
  }
}

function extractVariables(text: string, sourceName: ObjectKeys<typeof URLS>) {
  // extract needed variables
  let allvars: string;
  if (sourceName !== "MEGACLOUD") {
    allvars =
      text
        .match(
          /const (?:\w{1,2}=(?:'.{0,50}?'|\w{1,2}\(.{0,20}?\)).{0,20}?,){7}.+?;/gm,
        )
        ?.at(-1) ?? "";
  } else {
    allvars =
      text
        .match(/const \w{1,2}=new URLSearchParams.+?;(?=function)/gm)
        ?.at(-1) ?? "";
  }
  // and convert their values into an array of numbers
  const vars = allvars
    .slice(0, -1)
    .split("=")
    .slice(1)
    .map((pair) => Number(pair.split(",").at(0)))
    .filter((num) => num === 0 || num);

  return vars;
}

// Copied from minified script of rapid-cloud.co
// Slightly modified for readibility and ease of use
function getSecret(encryptedString: string, values: number[]) {
  let secret = "",
    encryptedSource = encryptedString,
    totalInc = 0;

  for (let i = 0; i < values[0]!; i++) {
    let start, inc;
    switch (i) {
      case 0:
        (start = values[2]), (inc = values[1]);
        break;
      case 1:
        (start = values[4]), (inc = values[3]);
        break;
      case 2:
        (start = values[6]), (inc = values[5]);
        break;
      case 3:
        (start = values[8]), (inc = values[7]);
        break;
      case 4:
        (start = values[10]), (inc = values[9]);
        break;
      case 5:
        (start = values[12]), (inc = values[11]);
        break;
      case 6:
        (start = values[14]), (inc = values[13]);
        break;
      case 7:
        (start = values[16]), (inc = values[15]);
        break;
      case 8:
        (start = values[18]), (inc = values[17]);
    }
    const from = start! + totalInc,
      to = from + inc!;
    (secret += encryptedString.slice(from, to)),
      (encryptedSource = encryptedSource.replace(
        encryptedString.substring(from, to),
        "",
      )),
      (totalInc += inc!);
  }

  return { secret, encryptedSource };
}

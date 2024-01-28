import { HttpService } from "@nestjs/axios";
import {
  EncryptedSourceResult,
  SourceResult,
} from "src/anime/interfaces/anime.interface";
import { ApiException } from "src/errors/http.exception";
import { ObjectKeys } from "src/interfaces/helpers.types";
import { decrypt } from "./cypher";

export interface SourceResponse
  extends Omit<SourceResult, "sources" | "playerUrl"> {
  sources: string | SourceResult["sources"];
  encrypted: boolean;
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
  if (playerUrl.startsWith("https://southcloud.tv"))
    playerSource = "SOUTHCLOUD";
  else if (playerUrl.startsWith("https://rapid-cloud.co"))
    playerSource = "RAPIDCLOUD";

  const urls = URLS[playerSource];

  // grab encrypted string
  let sourceResponse: SourceResponse;
  try {
    sourceResponse = (
      await httpService.axiosRef.get(urls.GET_SOURCES.concat(videoId))
    ).data;
    if (!sourceResponse) throw new Error("No response");
  } catch (err) {
    throw new ApiException("Internal request failed", 400, {
      cause: err,
      description: "Check url has a valid video id",
    });
  }
  // if source is not encrypted, then I am done
  const encryptedString = sourceResponse.sources;
  if (Array.isArray(encryptedString)) {
    const result = {
      ...sourceResponse,
      sources: encryptedString,
      encrypted: undefined,
      playerUrl,
    };
    return result;
  }

  // get script
  const scriptUrl = urls.GET_SCRIPT.concat(Date.now().toString());
  console.log("SCRIPT URL:", scriptUrl);
  let text: string;
  try {
    text = (await httpService.axiosRef.get(scriptUrl)).data;
  } catch (err) {
    throw new ApiException("Internal server error", 500, {
      cause: err,
      description: "Failed to get script to decrypt source",
    });
  }

  // create function to decrypt string, extracted from script
  const getsecret = parseScript(text, encryptedString);

  try {
    const { secret, encryptedSource } = eval(getsecret);

    const decrypted = decrypt(encryptedSource, secret);

    const sources: EncryptedSourceResult[] = JSON.parse(decrypted);

    // return a formatted source
    const result = {
      ...sourceResponse,
      sources,
      encrypted: undefined,
      playerUrl,
    };
    return result;
  } catch (err) {
    console.log(err);
    throw new ApiException("Internal Server Error", 500, {
      cause: err,
      description: "Failed to decrypt source",
    });
  }
}

// another possible regex to get variables; get last match
// /;const (?:[a-zA-Z]{1,2}=.+?(?:,|;)(?=[a-zA-Z])){10,}/gm

function parseScript(text: string, encryptedString: string) {
  // get global variables
  const allvars =
    text
      .match(
        /(?<=const (?:[a-zA-Z]{1,2}=(?:'.{0,50}?'|[a-zA-Z]{1,2}\(.{1,6},.{1,6}\))\+[a-zA-Z],)(?:[a-zA-Z]{1,2}=(?:'.{0,50}?'|[a-zA-Z]{1,2}\(.{1,6},.{1,6}\)),){6})(?:[a-zA-Z]=.{1,6}(?:,|;))+/gm,
      )
      ?.at(-1) ?? "";
  // format variables to be used
  const vars = "const " + allvars;

  // get the decrypting function
  let start = text.length;
  let end = -1;
  let found = false;
  for (let i = text.length - 1; i > 0; i--) {
    if (found && text[i] === "=") break;
    start--;
    if (
      text[i] === ")" &&
      text[i + 1] === ";" &&
      text[i + 2] === "}" &&
      text[i + 3] === ";" &&
      end < 0
    ) {
      end = i + 3;
    }
    if (text[i + 1] === "=" && text[i + 2] === ">") found = true;
  }
  // const start = text.search(
  //   /(?<=Storage&&localStorage\[.+?\]\(\w{1,2}\);\},\w{1,2}=)\w{1,2}=>\{function \w{1,2}\(\w,\w\)\{return \w{1,2}/gm,
  // );
  let func = text.slice(start, end);

  // replace function calls with their values
  const values = ["slice", "replace", "substring"];
  let count = 0;
  let inside = false; // to check against "[..'...].'..]"
  for (let i = 0; i < func.length; i++) {
    const c = func[i];
    if (c === "[") {
      let j = i + 1;
      while (func[j] !== "]" || inside) {
        if (func[j] === "'") inside = !inside;
        j++;
      }
      func = func.slice(0, i + 1) + `"${values[count]}"` + func.slice(j);
      count++;
    }
  }

  // extract variable names
  const secretName =
    Array.from(func.match(/(?<=let )\w{1,2}(?=='',\w{1,2}=)/gm) ?? [])[0] ?? "";
  const encryptedName =
    Array.from(func.match(/(?<=let \w{1,2}='',)\w{1,2}(?==)/gm) ?? [])[0] ?? "";

  // replace the return values with the variables I need
  func = func.replace(
    /return \w{1,2}\(\w{1,2},\w{1,2}\);}$/gm,
    `return { secret: ${secretName}, encryptedSource: ${encryptedName} };\n}`,
  );

  // build the new script that will be called with eval()
  const getsecret = `function main() { ${vars}; return (${func.trim()})("${encryptedString}") }\nmain()`;

  return getsecret;
}

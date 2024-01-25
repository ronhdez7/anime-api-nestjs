import { HttpService } from "@nestjs/axios";
import { ObjectKeys, SourceCard } from "src/anime/interfaces/anime.interface";
import { js as beautify } from "js-beautify";
import { AES, enc } from "crypto-js";
import { ApiException } from "src/errors/http.exception";

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
): Promise<SourceCard> {
  // extract video id from url
  const videoId = new URL(playerUrl).pathname.split("/").at(-1);
  if (!videoId) {
    /* Maybe return null */
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
  let encryptedString: string | any[];
  try {
    encryptedString = (
      await httpService.axiosRef.get(urls.GET_SOURCES.concat(videoId))
    ).data.sources;
  } catch (err) {
    throw new ApiException("Internal request failed", 400, {
      cause: err,
      description: "Check url has a valid video id",
    });
  }
  // if source is not encrypted, then I am done
  if (Array.isArray(encryptedString)) return encryptedString[0];

  // get script
  let script: string;
  try {
    script = (
      await httpService.axiosRef.get(
        urls.GET_SCRIPT.concat(Date.now().toString()),
      )
    ).data;
  } catch (err) {
    throw new ApiException("Internal server error", 500, {
      cause: err,
      description: "Failed to get script to decrypt source",
    });
  }
  // prettify script to make it easy to extract info from it
  const text = beautify(script);

  // get global variables
  const allvars =
    Array.from(text.match(/const(?:[\s,]+\w{1,2}\s=\s.+){10,};/gim) ?? [])?.at(
      -1,
    ) ?? "";
  // format variables to be used
  const vars = "const " + allvars.split(",\n").slice(7).join(",\n");

  // get the decrypting function
  let func = "";
  let found = false;
  for (let i = text.length - 1; i > 0; i--) {
    if (found && text[i] === " ") break;
    func = text[i] + func;
    if (i > text.length - 20) continue;

    if (text[i + 1] === "=" && text[i + 2] === ">") found = true;
  }

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
  const keyName =
    Array.from(func.match(/(?<=let )\w{1,2}(?=\s=)/gm) ?? [])[0] ?? "";
  const encryptedName =
    Array.from(func.match(/(?<=\s+)\w{1,2}(?=\s=)/gm) ?? [])[1] ?? "";

  // replace the return values with the variables I need
  func = func.replace(
    /return .+;\n\s*\};/,
    `return { key: ${keyName}, encryptedSource: ${encryptedName} };\n};`,
  );

  // build the new script that will be called with eval()
  const getkey = `function main() {
		${vars};
		return (${func.trim().slice(0, -1)})("${encryptedString}")
	}\nmain()`;

  try {
    const { key, encryptedSource } = eval(getkey);

    // decrypt source and convert it to array of sources
    const val = JSON.parse(
      AES.decrypt(encryptedSource, key).toString(enc.Utf8),
    );

    // return the only source available
    return { url: val[0].file };
  } catch (err) {
    throw new ApiException("Internal Server Error", 500, {
      cause: err,
      description: "Failed to decrypt source",
    });
  }
}

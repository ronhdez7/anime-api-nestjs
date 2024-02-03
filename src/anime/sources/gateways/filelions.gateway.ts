import { SourceResult } from "src/anime/interfaces/anime.interface";
import { SourceName } from "../interfaces/source.interface";
import { SourceServiceGateway } from "../source.gateway";
import { HttpService } from "@nestjs/axios";
import { ApiException } from "src/errors/http.exception";
import { StreamwishPlayerSetup } from "../interfaces/streamwish.interface";
import * as cheerio from "cheerio";

export class FilelionsSourceGateway implements SourceServiceGateway {
  SOURCE_NAME: SourceName = "FILELIONS";

  constructor(private readonly httpService: HttpService) {}

  async getSources(playerUrl: string): Promise<SourceResult> {
    let playerHtml: string;
    try {
      playerHtml = (await this.httpService.axiosRef.get(playerUrl)).data;
    } catch (err) {
      throw new ApiException("Invalid url", 400, { cause: err });
    }

    const $ = cheerio.load(playerHtml);
    const text =
      $(`body > script[type="text/javascript"]`).first().html() ?? "";
    const textargs: string =
      text?.match(/(?<=;return p\}\()'.+?(?=\)$)/gm)?.at(0) ?? "";
    const args: any[] = [];
    let count = 0;
    let i = textargs.length - 1;
    let j = i;
    while (count < 3) {
      if (i < 0) break;
      if (textargs[i] === ",") {
        const arg = textargs.slice(i + 1, j);
        args.push(arg);
        j = i;
        count++;
      }
      i--;
    }
    args.push(textargs.slice(0, j));

    const script: string = convertToSetup(
      args[3]!.trim(),
      Number(args[2]!.trim()),
      Number(args[1]!.trim()),
      eval(args[0]!.trim()),
    );

    const textsetup = (
      script
        .match(/(?<=jwplayer\("vplayer"\)\.setup\()[^]+?(?=\);)/gm)
        ?.at(0) ?? ""
    ).replaceAll("\\'", "'");

    let setup: StreamwishPlayerSetup;
    try {
      setup = eval(`(${textsetup.toString()})`);
      if (!setup) throw new Error();
    } catch (err) {
      throw new ApiException("Make sure url is correct", 500, {
        cause: err,
        description: "Could not parse player html",
      });
    }

    return {
      sources: setup.sources.map((s) => ({
        url: s.file,
        type: (s as any).type ?? "",
      })),
      tracks: setup.tracks,
      intro: { start: 0, end: 0 },
      outro: { start: 0, end: 0 },
      playerUrls: [playerUrl],
      thumbnail: setup.image,
      duration: Number(setup.duration) ?? -1,
    };
  }
}

function convertToSetup(p: string, a: number, c: number, k: string) {
  while (c--)
    if (k[c])
      p = p.replace(new RegExp("\\b" + c.toString(a) + "\\b", "g"), k[c]!);
  return p;
}

import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as supertest from "supertest";
import { AppModule } from "../src/app.module";
import { ANIME_PROVIDER_DETAILS } from "src/anime/anime.constants";
import {
  AnimeResult,
  EpisodeResult,
  ServerResult,
} from "src/anime/interfaces/anime.interface";
import {
  animeResultSchema,
  episodeResultSchema,
  serverResultSchema,
  sourceResultSchema,
} from "../src/anime/schemas/anime.schema";
import { TestResponse, TestSuccess } from "src/interfaces/test.interface";
import { testIf } from "src/test/utils";

/*
 * Creates a test suite for each provider
 */
describe.each(Object.values(ANIME_PROVIDER_DETAILS))(
  `$type (e2e)`,
  (details) => {
    let app: INestApplication;
    let request: supertest.SuperTest<supertest.Test>;

    // set before each url to go to right provider route
    const urlPrefix = `/${details.type.toLowerCase()}`;
    function setUrl(pathname: string) {
      return urlPrefix.concat(pathname);
    }

    // updated during tests
    let url: string = `/`;

    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();

      request = supertest(app.getHttpServer());
    });

    afterAll(async () => {
      await app.close();
    });

    /*
     * Scrape Anime
     */
    test("GET / 200", (done) => {
      request
        .get(setUrl("/"))
        .expect(200)
        .expect((res: TestResponse) =>
          animeResultSchema.parse(res.body.success && res.body.data),
        )
        .expect(
          (res: TestSuccess<AnimeResult[]>) => (url = res.body.data[0]!.url),
        )
        .end(done);
    });

    /*
     * Simple Anime Filtering
     */
    test("GET /filter 200", (done) => {
      request
        .get(setUrl(`/filter?keyword=one+piece`))
        .expect(200)
        .expect((res: TestResponse) =>
          animeResultSchema.parse(res.body.success && res.body.data),
        )
        .end(done);
    });

    /*
     * Tries to fetch episodes, but throws error due to invalid url
     */
    test("GET /episodes 400", (done) => {
      request
        .get(setUrl(`/episodes?url=${url.slice(0, -10)}`))
        .expect(400)
        .end(done);
    });

    /*
     * Tries to fetch episodes, but throws error due to anime not found
     * Skips Gogoanime
     */
    testIf(details.type !== "GOGOANIME")("GET /episodes 404", (done) => {
      let fakeId = "";
      if (details.type === "9ANIME") {
        fakeId = "-12345";
      } else if (details.type === "ANICRUSH") {
        fakeId = ".abcdef";
      }

      request
        .get(setUrl(`/episodes?url=${url}${fakeId}`))
        .expect(404)
        .end(done);
    });

    /*
     * Fetch episodes
     */
    test("GET /episodes 200", (done) => {
      request
        .get(setUrl(`/episodes?url=${url}`))
        .expect(200)
        .expect((res: TestResponse) =>
          episodeResultSchema.parse(res.body.success && res.body.data),
        )
        .expect(
          (res: TestSuccess<EpisodeResult[]>) =>
            (url = res.body.data.find((ep) => ep.url)!.url!),
        )
        .end(done);
    });

    /*
     * Tries to fetch servers, but throws due to invalid url
     * Skips Gogoanime
     */
    testIf(details.type !== "GOGOANIME")("GET /servers 400", (done) => {
      request
        .get(setUrl(`/servers?url=${url}abcde`))
        .expect(400)
        .end(done);
    });

    /*
     * Tries to fetch servers, but throws due to invalid episode
     */
    test("GET /servers 404", (done) => {
      request
        .get(setUrl(`/servers?url=${url}123456`))
        .expect(404)
        .end(done);
    });

    /*
     * Fetch servers
     */
    test("GET /servers 200", (done) => {
      request
        .get(setUrl(`/servers?url=${url}`))
        .expect(200)
        .expect((res: TestResponse) =>
          serverResultSchema.parse(res.body.success && res.body.data),
        )
        .expect(
          (res: TestSuccess<ServerResult[]>) =>
            (url = res.body.data[0]!.playerUrl),
        )
        .end(done);
    });

    /*
     * Gets sources
     */
    test("GET /sources 200", (done) => {
      request
        .get(`/sources?url=${url}`)
        .expect(200)
        .expect((res: TestResponse) =>
          sourceResultSchema.parse(res.body.success && res.body.data),
        )
        .end(done);
    });
  },
);

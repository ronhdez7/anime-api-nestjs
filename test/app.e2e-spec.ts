/**
 * Not used, replaced by individual testing files for each provider
 *
 * Missing source error tests
 */

import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as supertest from "supertest";
import { AppModule } from "../src/app.module";
import {
  ANIME_PROVIDER,
  ANIME_PROVIDER_DETAILS,
  ANIME_SERVICE,
} from "src/anime/anime.constants";
import {
  AnimeProvider,
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
import { ApiResponse } from "src/interfaces/api.interface";

interface TestResponse<Body = any> extends supertest.Response {
  body: ApiResponse<Body>;
}

interface TestSuccess<Body = any> extends supertest.Response {
  body: { success: true; data: Body };
}

// interface TestError extends supertest.Response {
//   body: { success: false; error: ApiExceptionResponse };
// }

function AppE2ETest(provider: AnimeProvider) {
  const details = ANIME_PROVIDER_DETAILS[provider];
  const animeService = details.service;

  describe.skip(`${animeService.name} (e2e)`, () => {
    let app: INestApplication;
    let request: supertest.SuperTest<supertest.Test>;

    // updated during tests
    let url: string = "/";

    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideProvider(ANIME_SERVICE)
        .useClass(animeService)
        .compile();

      app = moduleFixture.createNestApplication();
      await app.init();

      request = supertest(app.getHttpServer());
    });

    // Anime Scraping
    test("GET / 200", (done) => {
      request
        .get(url)
        .expect(200)
        .expect((res: TestResponse) =>
          animeResultSchema.parse(res.body.success && res.body.data),
        )
        .expect(
          (res: TestSuccess<AnimeResult[]>) => (url = res.body.data[0]!.url),
        )
        .end(done);
    });

    // Filter Anime
    test("GET /filter 200", (done) => {
      request
        .get("/filter?keyword=one+piece")
        .expect(200)
        .expect((res: TestResponse) =>
          animeResultSchema.parse(res.body.success && res.body.data),
        )
        .end(done);
    });

    // Get episodes
    test("GET /episodes 400", (done) => {
      request
        .get(`/episodes?url=${url.slice(0, -10)}`)
        .expect(400)
        .end(done);
    });

    test("GET /episodes 404", (done) => {
      request.get(`/episodes?url=${url}.-12345`).expect(404).end(done);
    });

    test("GET /episodes 200", (done) => {
      console.log("EPISODES URL:", url);

      request
        .get(`/episodes?url=${url}`)
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

    // get servers
    test("GET /servers 400", (done) => {
      request.get(`/servers?url=${url}abcde`).expect(400).end(done);
    });

    test("GET /servers 404", (done) => {
      request.get(`/servers?url=${url}123456`).expect(404).end(done);
    });

    test("GET /servers 200", (done) => {
      request
        .get(`/servers?url=${url}`)
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

    // get sources
    test("GET /sources 200", (done) => {
      request
        .get(`/sources?url=${url}`)
        .expect(200)
        .expect((res: TestResponse) =>
          sourceResultSchema.parse(res.body.success && res.body.data),
        )
        .end(done);
    });

    afterAll(async () => {
      await app.close();
      url = "/";
    });
  });
}

// run all tests of providers
const providers: AnimeProvider[] = Object.values(ANIME_PROVIDER);
providers.forEach((provider) => {
  if (provider === ANIME_PROVIDER.GOGOANIME) return;
  AppE2ETest(provider);
});

// AppE2ETest(ANIME_PROVIDER.ANICRUSH);

// so that jest doesn't complain for not having any tests
describe.skip("Skip", () => {});

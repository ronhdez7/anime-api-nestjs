import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import {
  animeResultSchema,
  episodeResultSchema,
  serverResultSchema,
  sourceResultSchema,
} from "src/anime/schemas/anime.schema";
import { TestResponse, TestSuccess } from "src/interfaces/test.interface";
import {
  AnimeResult,
  EpisodeResult,
  ServerResult,
} from "src/anime/interfaces/anime.interface";
import { AppModule } from "src/app.module";
import { ANIME_SERVICE } from "src/anime/anime.constants";
import * as supertest from "supertest";
import { GogoanimeService } from "../gogoanime.service";

describe.skip("GOGOANIME End-To-End Test", () => {
  let app: INestApplication;
  let request: supertest.SuperTest<supertest.Test>;

  // updated during tests
  let url: string = "/";

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ANIME_SERVICE)
      .useClass(GogoanimeService)
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

  test("GET /episodes 200", (done) => {
    console.log(url);
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

import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as supertest from "supertest";
import { AppModule } from "../src/app.module";
import {
  ANIME_PROVIDER,
  ANIME_PROVIDER_DETAILS,
  ANIME_STREAMING_SERVICE,
} from "src/anime/anime.constants";
import { AnimeProvider } from "src/anime/interfaces/anime.interface";

function AppE2ETest(provider: AnimeProvider) {
  const details = ANIME_PROVIDER_DETAILS[provider];
  const animeService = details.service;

  describe(`${animeService.name} (e2e)`, () => {
    let app: INestApplication;
    let request: supertest.SuperTest<supertest.Test>;

    // updated during tests
    let url: string = "/";

    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideProvider(ANIME_STREAMING_SERVICE)
        .useClass(animeService)
        .compile();

      app = moduleFixture.createNestApplication();
      await app.init();

      request = supertest(app.getHttpServer());
    });

    // get animes
    it("GET / 200", async () => {
      const response = await request.get(url).expect(200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(5);
      url = response.body.data[0].link;
    });

    it("GET /filter 200", async () => {
      const FILTER_URL = `/filter?genres=1%2C2&page=1&keyword=one-piece`;
      const response = await request.get(FILTER_URL).expect(200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(5);
    });

    // get episodes
    it("GET /episodes 200", async () => {
      const GOOD_URL = url;
      const goodRes = await request
        .get(`/episodes?url=${GOOD_URL}`)
        .expect(200);
      expect(goodRes.body.data.length).toBeGreaterThan(0);
      url = goodRes.body.data[0].link;
    });

    it("GET /episodes 400", async () => {
      const BAD_URL = url.slice(8);
      request.get(`/episodes?url=${BAD_URL}`).expect(400);
    });

    it("GET /episodes 404", async () => {
      const BAD_URL = `${url}000000`;
      request.get(`/episodes?url=${BAD_URL}`).expect(404);
    });

    // get servers
    it("GET /servers 200", async () => {
      const GOOD_URL = url;
      const goodRes = await request.get(`/servers?url=${GOOD_URL}`).expect(200);
      expect(goodRes.body.data.length).toBeGreaterThan(0);
      expect(goodRes.body.data[0].source.link).toBeTruthy();
    });

    it("GET /servers 400", async () => {
      const BAD_URL = url.slice(8);
      request.get(`/servers?url=${BAD_URL}`).expect(400);
    });

    it("GET /servers 404", () => {
      const BAD_URL = `${url}000000`;
      request.get(`/servers?url=${BAD_URL}`).expect(404);
    });

    afterAll(async () => {
      await app.close();
    });
  });
}

// run all tests of providers
const providers: AnimeProvider[] = Object.values(ANIME_PROVIDER);
providers.forEach((provider) => {
  AppE2ETest(provider);
});

// so that jest doesn't complain for not having any tests
describe.skip("Skip", () => {});

import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { sourceResultSchema } from "src/anime/schemas/anime.schema";
import { SourceName } from "src/anime/sources/interfaces/source.interface";
import { AppModule } from "src/app.module";
import { TestResponse } from "src/interfaces/test.interface";
import * as supertest from "supertest";

const SOURCES: Record<SourceName, string[]> = {
  // dont have fixed urls; tested during e2e tests
  RAPIDCLOUD: [],
  SOUTHCLOUD: [],
  MEGACLOUD: [],
  EMBTAKU: [
    "https://embtaku.pro/streaming.php?id=MjE5ODc1&title=Happy+ComeCome+Episode+1",
    "https://embtaku.pro/streaming.php?id=MjE5NzEy&title=Kyuujitsu+no+Warumono-san+Episode+4",
  ],
  STREAMWISH: [
    "https://awish.pro/e/pdgtdvh9z1br",
    "https://awish.pro/e/6yuv4a6wczd4",
  ],
  MP4UPLOAD: ["https://www.mp4upload.com/embed-afjr5n65ibjf.html"],
  DOODSTREAM: [
    "https://dood.wf/e/pk4aiu1tl2ep",
    "https://dood.wf/e/crtetgyirrda",
  ],
  FILELIONS: [
    "https://alions.pro/v/qp8l3zlf4x4g",
    "https://alions.pro/v/eh6ithfyrcku",
  ],
};

describe("Sources Test", () => {
  let app: INestApplication;
  let request: supertest.SuperTest<supertest.Test>;

  // updated during tests
  let url: string = "/";

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
    url = "/";
  });

  test.each(Object.keys(SOURCES))("%s", async (name: SourceName) => {
    const urls = SOURCES[name];
    // expect.assertions(urls.length);

    for (const url of urls) {
      await request
        .get(`/sources?url=${encodeURIComponent(url)}`)
        .expect(200)
        .expect((res: TestResponse) =>
          sourceResultSchema.parse(res.body.success && res.body.data),
        );
    }
  });
});

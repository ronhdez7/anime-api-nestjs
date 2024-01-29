import { HttpModule } from "@nestjs/axios";

export const FetchModule = HttpModule.register({
  timeout: 10000,
});

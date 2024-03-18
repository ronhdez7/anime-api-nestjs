import { HttpRedirectResponse } from "@nestjs/common";

export class Redirection {
  constructor(
    private readonly url: HttpRedirectResponse["url"],
    private readonly statusCode: HttpRedirectResponse["statusCode"] = 302,
  ) {}

  getResponse(): HttpRedirectResponse {
    return { url: this.url, statusCode: this.statusCode };
  }
}

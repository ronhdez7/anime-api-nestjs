import { HttpRedirectResponse } from "@nestjs/common";

/**
 * Returned from route to indicate a redirection to the serializer.
 *
 * Otherwise response would be considered data.
 */
export class Redirection {
  constructor(
    private readonly url: HttpRedirectResponse["url"],
    private readonly statusCode: HttpRedirectResponse["statusCode"] = 302,
  ) {}

  /**
   * Converts instance into valid HttpRedirectResponse object
   */
  getResponse(): HttpRedirectResponse {
    return { url: this.url, statusCode: this.statusCode };
  }
}

import { HttpStatus } from "@nestjs/common";
import { ApiException } from "src/errors/http.exception";

export function animePageNotFoundError(cause?: unknown) {
  return new ApiException(
    "Anime page not found. Check url.",
    HttpStatus.NOT_FOUND,
    { cause },
  );
}

export function episodePageNotFoundError(cause?: unknown) {
  return new ApiException(
    "Episodes page not found. Check url.",
    HttpStatus.NOT_FOUND,
    { cause },
  );
}

export function serverPageNotFoundError(cause?: unknown) {
  return new ApiException(
    "Servers page not found. Check url.",
    HttpStatus.NOT_FOUND,
    { cause },
  );
}

export function sourceNotFoundError(cause?: unknown) {
  return new ApiException(
    "Source not found. Check url.",
    HttpStatus.NOT_FOUND,
    { cause },
  );
}

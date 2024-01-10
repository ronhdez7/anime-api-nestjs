import { Controller, Get, HttpStatus } from "@nestjs/common";
import { ApiException } from "./errors/http.exception";

@Controller()
export class AppController {
  @Get("error")
  error() {
    throw new ApiException("Unknown error", HttpStatus.INTERNAL_SERVER_ERROR, {
      description: "Created on purpose",
    });
  }
}

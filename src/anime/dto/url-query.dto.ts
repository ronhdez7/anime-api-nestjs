import { IsNotEmpty, IsString, IsUrl } from "class-validator";

export class UrlQueryDTO {
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  url: string;
}

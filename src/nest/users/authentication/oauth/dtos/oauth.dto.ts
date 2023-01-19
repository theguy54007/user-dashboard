import { Expose } from "class-transformer";
import { IsString } from "class-validator";

export class OauthDto{

  @Expose()
  source: string
}

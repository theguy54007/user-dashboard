import { Expose } from "class-transformer";

export class OauthDto{

  @Expose()
  source: string
}

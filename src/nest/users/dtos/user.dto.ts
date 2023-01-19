import { Expose, Type } from "class-transformer";
import { OauthDto } from "../authentication/oauth/dtos/oauth.dto";

export class UserDto{

  @Expose()
  email: string;

  @Expose()
  name: string;

  @Expose()
  @Type(() => OauthDto)
  oauths: OauthDto[]
}

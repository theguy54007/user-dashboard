import { OauthAbstract } from "../oauth/oauth.abstract";

export abstract class UserAbstract{
  email: string;
  name: string;
  createdAt: Date;
  signInCount: number;
  lastSessionAt: Date;
  oauths: OauthAbstract[];
}

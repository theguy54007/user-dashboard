import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { OauthService } from './oauth.service';
import { accessTokenCookieOptions } from '../auth.constant';

@Controller('oauth')
export class OauthController {

  constructor(
    private oauthService: OauthService
  ){}

  @Post('google')
  async googleAuth(@Body('idToken') idToken: string, @Res({passthrough: true}) response: Response){
    const result = await this.oauthService.googleAuth(idToken)

    response.cookie('accessToken', result.accessToken, accessTokenCookieOptions)
    return result
  }

  @Post('facebook')
  async facebookAuth(@Body('accessToken') accessToken: string, @Res({passthrough: true}) response: Response){
    const result = await this.oauthService.facebookAuth(accessToken)
    response.cookie('accessToken', result.accessToken, accessTokenCookieOptions)

    return result
  }


}

import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { OauthService } from './oauth.service';
import { accessTokenCookieOptions } from '../constants/auth.constant';
import { ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Serialize } from 'src/nest/interceptors/serialize.interceptor';
import { GoogleLoginDto } from './dtos/google-login.dto';
import { FacebookLoginDto } from './dtos/facebook-login.dto';
import { INVALID_FB_TOKEN, INVALID_GOOGLE_TOKEN } from 'src/nest/shared/error-messages.constant';
import { UserDto } from '../../dtos/user.dto';

@Controller('oauth')
@ApiTags('Google Login & Facebook Login')
@Serialize(UserDto)
export class OauthController {

  constructor(
    private oauthService: OauthService
  ){}

  @Post('google')
  @ApiOperation({
    description: "Login with google, create a user data when it is first time login."
  })
  @ApiResponse({
    status: 201,
    type: UserDto
  })
  @ApiUnauthorizedResponse({
    description: INVALID_GOOGLE_TOKEN
  })
  async googleAuth(
    @Body() body: GoogleLoginDto,
    @Res({ passthrough: true }) response: Response
  ){
    const { user, accessToken } = await this.oauthService.googleAuth(body.idToken)
    response.cookie('accessToken', accessToken, accessTokenCookieOptions)

    return user
  }

  @Post('facebook')
  @ApiOperation({
    description: "Login with google, create a user data when it is first time login."
  })
  @ApiResponse({
    status: 201,
    type: UserDto
  })
  @ApiUnauthorizedResponse({
    description: INVALID_FB_TOKEN
  })
  async facebookAuth(
    @Body() body: FacebookLoginDto,
    @Res({ passthrough: true }) response: Response
  ){
    const { user, accessToken } = await this.oauthService.facebookAuth(body.accessToken)
    response.cookie('accessToken', accessToken, accessTokenCookieOptions)
    return user
  }


}

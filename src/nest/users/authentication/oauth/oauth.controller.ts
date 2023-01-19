import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { OauthService } from './oauth.service';
import { accessTokenCookieOptions } from '../constants/auth.constant';
import { ApiConflictResponse, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { SignInResponseDto } from '../dtos/sign-in-response.dto';
import { Serialize } from 'src/nest/interceptors/serialize.interceptor';
import { GoogleLoginDto } from './dtos/google-login.dto';
import { FacebookLoginDto } from './dtos/facebook-login.dto';
import { EMAIL_DUPLICATED, INVALID_FB_TOKEN, INVALID_GOOGLE_TOKEN } from 'src/nest/shared/error-messages.constant';

@Controller('oauth')
@ApiTags('Google Login & Facebook Login')
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
    type: SignInResponseDto
  })
  @ApiUnauthorizedResponse({
    description: INVALID_GOOGLE_TOKEN
  })
  @Serialize(SignInResponseDto)
  async googleAuth(
    @Body() body: GoogleLoginDto,
    @Res({ passthrough: true }) response: Response
  ){
    const result = await this.oauthService.googleAuth(body.idToken)
    response.cookie('accessToken', result.accessToken, accessTokenCookieOptions)

    return result
  }

  @Post('facebook')
  @ApiOperation({
    description: "Login with google, create a user data when it is first time login."
  })
  @ApiResponse({
    status: 201,
    type: SignInResponseDto
  })
  @ApiUnauthorizedResponse({
    description: INVALID_FB_TOKEN
  })
  @Serialize(SignInResponseDto)
  async facebookAuth(
    @Body() body: FacebookLoginDto,
    @Res({passthrough: true}) response: Response
  ){
    const result = await this.oauthService.facebookAuth(body.accessToken)
    response.cookie('accessToken', result.accessToken, accessTokenCookieOptions)

    return result
  }


}

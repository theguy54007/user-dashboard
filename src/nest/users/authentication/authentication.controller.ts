import { Body, Controller, Post, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from 'src/nest/guards/auth.guard';
import { Serialize } from 'src/nest/interceptors/serialize.interceptor';
import { CurrentUser } from '../decorator/current-user.decorator';
import { User } from '../user.entity';
import { AuthenticationService } from './authentication.service';
import { ResetForgotPasswordDto } from './dtos/reset-forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { SignInDto } from './dtos/sign-in.dto';
import { SignUpDto } from './dtos/sign-up.dto';
import { accessTokenCookieOptions } from './constants/auth.constant';
import { ApiBadRequestResponse, ApiConflictResponse, ApiForbiddenResponse, ApiHeader, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { SignUpResponseDto } from './dtos/sign-up-response.dto';
import { MessageResponseDto } from 'src/nest/dtos/message-response.dto';
import { LOGOUT_DONE, RESET_PASSWORD } from './constants/response-message.constant';
import { BAD_REQUEST, EMAIL_DUPLICATED, EMAIL_NOT_VERIFIED, EMAIL_TOKEN_INVALID, LOGIN_REQUIRE, MISSING_TOKEN, PASSWORD_INVALID, USER_NOT_EXIST } from 'src/nest/shared/error-messages.constant';
import { UserDto } from '../dtos/user.dto';
import { VerifyEmailDto } from './dtos/verify-email.dto';


@Controller('auth')
@ApiTags('Authentication')
export class AuthenticationController {

  constructor(
    private authService: AuthenticationService,
  ){}

  @Post('sign-up')
  @ApiResponse({
    status: 201,
    type: SignUpResponseDto
  })
  @ApiOperation({
    description: 'Create a new user with email not verified and send verification email.'
  })
  @ApiBadRequestResponse({
    description: BAD_REQUEST
  })
  @ApiConflictResponse({
    description: EMAIL_DUPLICATED
  })
  @Serialize(SignUpResponseDto)
  signUp(@Body() body: SignUpDto) {
    return this.authService.signUp(body);
  }

  @Post('sign-in')
  @ApiOperation({
    description: 'Sign In User'
  })
  @ApiResponse({
    status: 201,
    type: UserDto
  })
  @ApiUnauthorizedResponse({
    description: [
      PASSWORD_INVALID,
      USER_NOT_EXIST
    ].join(' / ')
  })
  @ApiForbiddenResponse({
    description: EMAIL_NOT_VERIFIED
  })
  @ApiBadRequestResponse({
    description: BAD_REQUEST
  })
  @Serialize(UserDto)
  async signIn(
    @Body() body: SignInDto,
    @Res({passthrough: true}) response: Response
  ){
    const {user, accessToken} = await this.authService.signIn(body)
    response.cookie('accessToken', accessToken, accessTokenCookieOptions)

    return user
  }

  @Post('/sign-out')
  @ApiOperation({
    description: 'Sign out user , then invalidate access token and session \n * Required to be logged in via `auth/sign-in` API'
  })
  @ApiResponse({
    status: 201,
    type: MessageResponseDto,
    description: LOGOUT_DONE
  })
  @ApiForbiddenResponse({
    description: LOGIN_REQUIRE
  })
  @UseGuards(AuthGuard)
  async signOut(
    @Res({passthrough: true})
    response: Response,
    @CurrentUser() user: User
  ){
    await this.authService.signOut(user.id)
    response.clearCookie('accessToken')

    return {
      message: LOGOUT_DONE
    }
  }


  @Post('/verify-email')
  @ApiOperation({
    description: 'verify the email and sign-in user'
  })
  @ApiResponse({
    status: 201,
    type: UserDto
  })
  @ApiUnauthorizedResponse({
    description: [
      USER_NOT_EXIST,
      MISSING_TOKEN,
      EMAIL_TOKEN_INVALID
    ].join(' / ')
  })
  @Serialize(UserDto)
  async verifyEmail(
    @Body() body: VerifyEmailDto,
    @Res({passthrough: true}) response: Response
  ){
    const { verifyToken } = body
    if (!verifyToken) throw new UnauthorizedException(MISSING_TOKEN)

    const { user, accessToken } = await this.authService.verifyEmail(verifyToken)
    response.cookie('accessToken', accessToken, accessTokenCookieOptions)

    return user
  }



  @Post('/reset-forgot-password')
  @ApiOperation({
    description: 'reset password when user forgot the original password.'
  })
  @ApiResponse({
    status: 201,
    type: MessageResponseDto,
    description: RESET_PASSWORD
  })
  @ApiBadRequestResponse({
    description: BAD_REQUEST
  })
  @ApiUnauthorizedResponse({
    description: [
      MISSING_TOKEN,
      USER_NOT_EXIST,
      EMAIL_TOKEN_INVALID
    ].join(' / ')
  })
  async resetForgotPassword(
    @Body() body: ResetForgotPasswordDto,
  ) {

    await this.authService.resetForgotPassword(body)
    return {
      message: RESET_PASSWORD
    }
  }

  @Post('/reset-password')
  @ApiOperation({
    description: 'reset password when user is logged in \n * Required to be logged in via `auth/sign-in` API'
  })
  @ApiResponse({
    status: 201,
    type: MessageResponseDto,
    description: RESET_PASSWORD
  })
  @ApiUnauthorizedResponse({
    description: [
      PASSWORD_INVALID
    ].join(' / ')
  })
  @ApiForbiddenResponse({
    description: LOGIN_REQUIRE
  })
  @UseGuards(AuthGuard)
  async resetPassword(
    @Body() body: ResetPasswordDto,
    @CurrentUser() user: User,
    @Res({passthrough: true}) response: Response
  ) {
    await this.authService.resetPassword(user, body)
    response.clearCookie('accessToken')
    return {
      message: RESET_PASSWORD
    }
  }
}

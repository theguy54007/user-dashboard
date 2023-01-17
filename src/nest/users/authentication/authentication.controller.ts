import { Body, Controller, Get, Headers, Post, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from 'src/nest/guards/auth.guard';
import { Serialize } from 'src/nest/interceptors/serialize.interceptor';
import { CurrentUser } from '../decorator/current-user.decorator';
import { UserDto } from '../dtos/user.dto';
import { User } from '../user.entity';
import { AuthenticationService } from './authentication.service';
import { ResetForgotPasswordDto } from './dtos/reset-forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { SignInDto } from './dtos/sign-in.dto';
import { SignUpResponseDto } from './dtos/sign-up-response.dto';
import { SignUpDto } from './dtos/sign-up.dto';

@Controller('auth')
export class AuthenticationController {

  constructor(
    private authService: AuthenticationService,
  ){}

  @Post('sign-up')
  signUp(@Body() body: SignUpDto) {
    return this.authService.signUp(body);
  }

  @Post('sign-in')
  @Serialize(SignUpResponseDto)
  async signIn(@Body() body: SignInDto, @Res({passthrough: true}) response: Response ){
    const user = await this.authService.signIn(body)
    const {accessToken} = await this.authService.generateTokens(user)

    response.cookie('accessToken', accessToken, this.accessTokenCookieOptions())

    return {
      user,
      accessToken,
    }
  }

  @Get('current-user')
  @UseGuards(AuthGuard)
  @Serialize(UserDto)
  getCurrentUser(@CurrentUser() user: User){
    return user
  }

  @Post('/sign-out')
  signOut(@Res({passthrough: true}) response: Response){
    response.clearCookie('accessToken')
  }

  @Post('/send-email-verification')
  async sendEmailVerify(@Body('email') email: string){
    await this.authService.sendVerificationEmail(email)
    return { message: 'Please check the email and click the confirmation link in the email within 5 minutes.'}
  }

  @Post('/verify-email')
  @Serialize(SignUpResponseDto)
  async verifyEmail(@Body('verifyToken') token: string, @Res({passthrough: true}) response: Response){
    const user = await this.authService.verifyEmail(token)
    const { accessToken } = await this.authService.generateTokens(user)

    response.cookie('accessToken', accessToken, this.accessTokenCookieOptions())

    return {
      user,
      accessToken,
    }
  }

  @Post('/send-reset-password-mail')
  async sendResetPasswordMail(@Body('email') email: string){
    await this.authService.sendResetPasswordEmail(email)
    return { message: 'Please check the email and click the reset link in the email within 5 minutes.' }
  }

  @Post('/reset-forgot-password')
  async resetForgotPassword(@Body() body: ResetForgotPasswordDto, @Headers('reset-token') token: string) {
    if (!token) throw new UnauthorizedException('missing reset token')

    await this.authService.resetForgotPassword(token, body)
    return {
      message: 'Reset done! Please login again with new password.'
    }
  }

  @Post('/reset-password')
  @UseGuards(AuthGuard)
  async resetPassword(@Body() body: ResetPasswordDto, @CurrentUser() user: User, @Res({passthrough: true}) response: Response) {
    await this.authService.resetPassword(user, body)
    response.clearCookie('accessToken')
    return {
      message: 'Reset done! Please login again with new password.'
    }
  }

  private accessTokenCookieOptions(expireDay?: number){
    const expiredTime = (expireDay || 7) * 24 * 3600 * 1000
    return {
      httpOnly: true,
      expires: new Date(new Date().getTime() + expiredTime)
    }
  }
}

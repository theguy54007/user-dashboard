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
import { SignInResponseDto } from './dtos/sign-in-response.dto';
import { SignUpDto } from './dtos/sign-up.dto';
import { accessTokenCookieOptions } from './auth.constant';

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
  @Serialize(SignInResponseDto)
  async signIn(@Body() body: SignInDto, @Res({passthrough: true}) response: Response ){
    const result = await this.authService.signIn(body)
    response.cookie('accessToken', result.accessToken, accessTokenCookieOptions)

    return result
  }

  @Get('current-user')
  @UseGuards(AuthGuard)
  @Serialize(UserDto)
  getCurrentUser(@CurrentUser() user: User){
    return user
  }

  @Post('/sign-out')
  @UseGuards(AuthGuard)
  async signOut(@Res({passthrough: true}) response: Response, @CurrentUser() user: User){
    await this.authService.signOut(user.id)
    response.clearCookie('accessToken')

    return {
      message: 'logout done'
    }
  }

  @Post('/send-email-verification')
  async sendEmailVerify(@Body('email') email: string){
    await this.authService.sendVerificationEmail(email)
    return { message: 'Please check the email and click the confirmation link in the email within 5 minutes.'}
  }

  @Post('/verify-email')
  @Serialize(SignInResponseDto)
  async verifyEmail(@Body('verifyToken') token: string, @Res({passthrough: true}) response: Response){
    const result = await this.authService.verifyEmail(token)
    response.cookie('accessToken', result.accessToken, accessTokenCookieOptions)

    return result
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
}

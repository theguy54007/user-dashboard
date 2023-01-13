import { Body, Controller, Get, Post, Query, Res, Session, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { CurrentUser } from '../decorator/current-user.decorator';
import { UserDto } from '../dtos/user.dto';
import { UsersService } from '../users.service';
import { AuthenticationService } from './authentication.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SignInDto } from './dto/sign-in.dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto/sign-up.dto';

@Controller('auth')
@Serialize(UserDto)
export class AuthenticationController {

  constructor(
    private authService: AuthenticationService,
    private userService: UsersService
  ){}

  @Post('sign-up')
  signUp(@Body() body: SignUpDto) {
    return this.authService.signUp(body);
  }

  @Post('sign-in')
  async signIn(@Body() body: SignInDto, @Session() session: Record<string, any> ){
    const user = await this.authService.signIn(body)
    const {accessToken} = await this.authService.generateTokens(user)

    session.accessToken = accessToken

    // response.cookie('accessToken', accessToken, {
    //   secure: true,
    //   httpOnly: true,
    //   sameSite: true
    // })

    // response.send('')
    return user
    // return accessToken
  }

  @Post('/sign-out')
  signOut(@Session() session: any){
    session.accessToken = null;
  }

  @Get('/send-email-verification')
  async sendEmailVerify(@CurrentUser() user){
    await this.authService.sendVerificationEmail(user)
    return { message: 'Please received the verification email and click the confirmation link within 5 minutes.'}
  }

  @Get('/verify-email')
  async emailVerify(@Query('token') token: string){
    try {
      const payload = await this.authService.decryptToken(token)
      const user = await this.userService.findOne(+payload.sub);
      return this.userService.update(user.id, {emailVerified: true})
      // return {
      //   message: "Your email is verified, please login with the account."
      // }
    } catch {
      throw new UnauthorizedException('token is invalid or expired, please login and resend verification email again.');
    }
  }

  @Get('/send-reset-password-mail')
  async sendResetPasswordMail(@Query('email') email: string){
    return this.authService.sendResetPasswordEmail(email)
  }

  @Get('/reset-password')
  async resetPasswordPage(@Query('token') token: string){
    try {
      const payload = await this.authService.decryptToken(token)
      const user = await this.userService.findOne(+payload.sub);
      return {
        email: user.email
      }
    } catch {
      throw new UnauthorizedException('token is invalid or expired, please try again.');
    }
  }

  @Post('/reset-password')
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body)
  }

}

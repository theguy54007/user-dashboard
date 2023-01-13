import { Body, Controller, Post, Res, Session } from '@nestjs/common';
import { Response } from 'express';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { UserDto } from '../dtos/user.dto';
import { AuthenticationService } from './authentication.service';
import { SignInDto } from './dto/sign-in.dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto/sign-up.dto';

@Controller('auth')
@Serialize(UserDto)
export class AuthenticationController {

  constructor(
    private authService: AuthenticationService
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

}

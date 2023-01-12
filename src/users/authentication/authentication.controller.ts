import { Body, Controller, Post, Session } from '@nestjs/common';
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
  async signIn(@Body() body: SignInDto, @Session() session: any ){
    const user = await this.authService.signIn(body)
    session.userId = user.id
    return user
  }

  @Post('/sign-out')
  signOut(@Session() session: any){
    session.userId = null;
  }

}

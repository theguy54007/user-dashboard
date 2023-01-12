import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { SignUpDto } from './dto/sign-up.dto/sign-up.dto';

@Injectable()
export class AuthenticationService {

  constructor(
    private userService: UsersService
  ){}

  async signUp(signUpDto: SignUpDto){
    const user = await this.userService.create(signUpDto);
    return user;
  }
}

import { PickType } from '@nestjs/mapped-types';
import { SignUpDto } from './sign-up.dto';
import { IsString } from 'class-validator';

export class SignInDto extends PickType(SignUpDto, ['email']) {
  @IsString()
  password: string;
}

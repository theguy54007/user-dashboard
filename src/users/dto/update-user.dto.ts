import { PickType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
export class UpdateUserDto extends PickType(CreateUserDto, ['email', 'name']) {

  @IsOptional()
  email: string;

  @IsOptional()
  name: string;
}

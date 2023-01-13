import { PickType } from '@nestjs/mapped-types';
import { Match } from 'src/nest/users/decorator/match.decorator';
import { CreateUserDto } from 'src/nest/users/dto/create-user.dto';

export class SignUpDto extends PickType(CreateUserDto,['email', 'password']) {

  @Match(CreateUserDto, (u) => u.password)
  passwordConfirmation: string;
}

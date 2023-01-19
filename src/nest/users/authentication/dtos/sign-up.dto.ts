import { ApiProperty, PickType } from '@nestjs/swagger';
import { Match } from 'src/nest/users/decorator/match.decorator';
import { CreateUserDto } from 'src/nest/users/dtos/create-user.dto';

export class SignUpDto extends PickType(CreateUserDto,['email', 'password']) {

  @ApiProperty({ description: 'must same with password' })
  @Match(CreateUserDto, (u) => u.password)
  passwordConfirmation: string;
}

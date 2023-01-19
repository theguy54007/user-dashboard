import { PickType } from '@nestjs/swagger';
import { SignUpDto } from './sign-up.dto';

export class SendEmailDto extends PickType(SignUpDto, ['email']) {}

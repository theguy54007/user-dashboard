import { PickType } from "@nestjs/swagger";
import { SignUpDto } from "./sign-up.dto"

export class ResetForgotPasswordDto extends PickType(SignUpDto, ['password', 'passwordConfirmation']) {}

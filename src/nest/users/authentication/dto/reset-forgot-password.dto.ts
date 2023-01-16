import { PickType } from "@nestjs/mapped-types";
import { SignUpDto } from "./sign-up.dto"

export class ResetForgotPasswordDto extends PickType(SignUpDto, ['password', 'passwordConfirmation']) {}

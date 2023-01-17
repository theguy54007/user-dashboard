import { PickType } from "@nestjs/mapped-types";
import { IsString } from "class-validator";
import { SignUpDto } from "./sign-up.dto"

export class ResetPasswordDto extends PickType(SignUpDto, ['password', 'passwordConfirmation']) {
  @IsString()
  oldPassword: string
}

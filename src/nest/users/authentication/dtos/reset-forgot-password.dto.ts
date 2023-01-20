import { ApiProperty, PickType } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { SignUpDto } from "./sign-up.dto"

export class ResetForgotPasswordDto extends PickType(SignUpDto, ['password', 'passwordConfirmation']) {
  @ApiProperty({
    description: 'reset token get from the link inside the email sent by `/send-reset-password-mail API` '
  })
  @IsString()
  resetToken: string
}

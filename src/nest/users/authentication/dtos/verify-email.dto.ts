import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class VerifyEmailDto{

  @ApiProperty({
    description: "'verify token get from the link inside the email sent by `/send-email-verification API` '"
  })
  @IsString()
  verifyToken: string
}

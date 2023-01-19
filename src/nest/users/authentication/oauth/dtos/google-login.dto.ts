import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class GoogleLoginDto {

  @ApiProperty({
    description: 'ID token get from google after user login with google'
  })
  @IsString()
  idToken: string
}

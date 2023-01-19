import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class FacebookLoginDto {

  @ApiProperty({
    description: 'Access token get from facebook after user login with facebook'
  })
  @IsString()
  accessToken: string
}

import { Expose, Type } from "class-transformer";
import { UserDto } from "../../dtos/user.dto";

export class SignUpResponseDto extends UserDto  {

  @Expose()
  @Type(() => UserDto)
  user: UserDto

  @Expose()
  accessToken: string
}

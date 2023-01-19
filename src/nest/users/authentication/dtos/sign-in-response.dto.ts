import { Expose, Type } from "class-transformer";
import { UserDto } from "../../dtos/user.dto";

export class SignInResponseDto extends UserDto  {

  @Expose()
  @Type(() => UserDto)
  user: UserDto

  @Expose()
  accessToken: string
}

import { Expose, Transform } from "class-transformer";
import { UserDto } from "./user.dto";

export class UserListDto extends UserDto {

  @Expose({name: 'created_at'})
  createdAt: Date;

  @Expose({name: 'sign_in_count'})
  signInCount: number;

  @Expose({name: 'last_session_at'})
  lastSessionAt: Date

}

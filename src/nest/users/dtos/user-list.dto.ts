import { Expose } from "class-transformer";
import { UserDto } from "./user.dto";

export class UserListDto extends UserDto {

  @Expose()
  createdAt: Date;

  @Expose()
  signInCount: number;

  @Expose()
  lastSessionAt: Date

}

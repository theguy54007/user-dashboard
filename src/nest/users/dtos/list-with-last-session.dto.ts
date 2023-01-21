import { Expose, Type } from "class-transformer";
import { UserListDto } from "./user-list.dto";

export class ListWithLastSessionDto {
  @Expose()
  total: number

  @Expose()
  @Type(() => UserListDto)
  users: UserListDto[]
}

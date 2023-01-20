import { Expose, Transform } from "class-transformer";
import * as moment from 'moment';

export class UserListDto {

  @Expose({name: 'created_at'})
  @Transform( ({ value }) => moment(value).toLocaleString())
  createdAt: Date;

  @Expose({name: 'sign_in_count'})
  signInCount: number;

  @Expose({name: 'last_session_at'})
  @Transform( ({ value }) => value ? moment(value).toLocaleString() : null)
  lastSessionAt: Date

}

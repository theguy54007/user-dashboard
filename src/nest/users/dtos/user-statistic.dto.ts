import { ApiProperty } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";

export class UserStatistic{

  @ApiProperty({
    description: "Total number of users who have signed up."
  })
  @Expose()
  total: number;

  @ApiProperty({
    description: "Total number of users with active sessions today."
  })
  @Expose()
  activeToday: number;

  @ApiProperty({
    description: "Average number of active session users in the last 7 days rolling."
  })
  @Expose()
  @Transform(({value}) => parseFloat(value.toFixed(2)))
  average7day: number;
}

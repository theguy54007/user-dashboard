import { Expose, Transform } from "class-transformer";

export class UserStatistic{

  @Expose()
  total: number;

  @Expose()
  activeToday: number;

  @Expose()
  @Transform(({value}) => parseFloat(value.toFixed(2)))
  average7day: number;
}

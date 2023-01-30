import { ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsOptional, IsPositive, Max } from "class-validator"

export class PaginationQueryDto {

  @ApiPropertyOptional({
    description: "Default as 1"
  })
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  page: number

  @ApiPropertyOptional({
    description: "Default as 5. Define the total number to be obtained"
  })
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  @Max(20)
  perPage: number
}

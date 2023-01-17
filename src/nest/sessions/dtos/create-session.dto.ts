import { IsNumber, IsString } from "class-validator";

export class CreateSessionDto{
  @IsString()
  actionName: string;

  @IsNumber()
  user_id: String;
}

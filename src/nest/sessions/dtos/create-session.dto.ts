import { Expose } from "class-transformer";
import { IsNumber, IsString } from "class-validator";

export class CreateSessionDto{
  @IsString()
  @Expose({name: 'action_name'})
  actionName: string;

  @IsNumber()
  user_id: String;
}

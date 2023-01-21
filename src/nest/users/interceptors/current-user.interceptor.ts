import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { UsersService } from "../users.service";

@Injectable()
export class CurrentUserInterceptor implements NestInterceptor{

  constructor(private readonly usersService: UsersService){}

  async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest()
    const { userId: id } = request.session || {};

    if (id){
      const user = await this.usersService.findWithOauth({ id });
      request.currentUser = user;
    }

    return next.handle()
  }
}

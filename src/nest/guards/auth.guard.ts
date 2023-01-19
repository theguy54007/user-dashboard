import { CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Observable } from "rxjs";
import { LOGIN_REQUIRE } from "../shared/error-messages.constant";

export class AuthGuard implements CanActivate{
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
      const request = context.switchToHttp().getRequest();
      if (!request.currentUser) {
        throw new ForbiddenException(LOGIN_REQUIRE)
      }
      return request.currentUser;
  }
}

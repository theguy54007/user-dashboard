import { Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { User } from "../user.entity";
import { UsersService } from "../users.service";
import { AuthenticationService } from "../authentication/authentication.service";

declare global {
  namespace Express {
    interface Request {
      currentUser?: User;
    }
  }
}

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {

  constructor(
    private usersService: UsersService,
    private authServcie: AuthenticationService
  ){}

  async use(req: Request, res: Response, next: NextFunction) {
    const { accessToken }  = req.session || {};

    if (accessToken) {
      try {
        const payload = await this.authServcie.decryptToken(accessToken)
        const user = await this.usersService.findOne(+payload.sub);
        req.currentUser = user;
      } catch {
        throw new UnauthorizedException();
      }
    }

    next();
  }
}

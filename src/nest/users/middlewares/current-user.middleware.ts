import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { User } from "../user.entity";
import { UsersService } from "../users.service";
import { TokenService } from "../token/token.service";

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
    private tokenService: TokenService
  ){}

  async use(req: Request, _: Response, next: NextFunction) {
    const { accessToken }  = req.cookies || {};

    if (accessToken) {
      try {
        const payload = await this.tokenService.decryptToken(accessToken)
        const user = await this.usersService.findOneBySession(payload.sub)
        req.currentUser = user;
      } catch {
        req.cookies.accessToken = null;
      }
    }
    next();
  }
}

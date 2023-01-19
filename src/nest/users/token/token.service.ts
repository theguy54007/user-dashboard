import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from 'config/jwt.config';

@Injectable()
export class TokenService {

  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ){}

  async decryptToken(token: string){
    const payload = await this.jwtService.verifyAsync(
      token,
      this.jwtConfiguration,
    );

    return payload
  }

  async signToken(
    sub: number | string,
    expiresIn: number = (this.jwtConfiguration.accessTokenTtl/1000)
  ) {
    return await this.jwtService.signAsync(
      {
        sub: sub,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn
      },
    );
  }
}

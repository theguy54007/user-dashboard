import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { HashingService } from '../hashing/hashing.service';
import { SignInDto } from './dto/sign-in.dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto/sign-up.dto';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { ActiveUserData } from './interfaces/active-user-data.interface';
import { User } from '../user.entity';

@Injectable()
export class AuthenticationService {

  constructor(
    private userService: UsersService,
    private hashingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ){}

  async signUp(signUpDto: SignUpDto){
    const { email }  = signUpDto
    const password  = await this.hashingService.hash(signUpDto.password);

    const user = await this.userService.create({email, password});
    return user;
  }

  async signIn(signInDto: SignInDto){
    const { email, password } = signInDto
    const user = await this.userService.findOneBy({email})

    if (!user) {
      throw new UnauthorizedException('User does not exists');
    }

    const isEqual = await this.hashingService.compare(
      password,
      user.password,
    );
    if (!isEqual) {
      throw new UnauthorizedException('Password does not match');
    }

    return user
  }

  async generateTokens(user: User) {
    const [accessToken] = await Promise.all([
      this.signToken<Partial<ActiveUserData>>(
        user.id,
        this.jwtConfiguration.accessTokenTtl,
        { email: user.email },
      )
    ]);

    return {
      accessToken
    };
  }

  async decryptToken(token: string){
    const payload = await this.jwtService.verifyAsync(
      token,
      this.jwtConfiguration,
    );

    return payload
  }
  private async signToken<T>(userId: number, expiresIn: number, payload?: T) {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        ...payload,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn,
      },
    );
  }
}

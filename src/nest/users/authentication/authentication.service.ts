import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/nest/users/users.service';
import { HashingService } from '../hashing/hashing.service';
import { SignInDto } from './dto/sign-in.dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto/sign-up.dto';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../../../../config/jwt.config';
import { ConfigService, ConfigType } from '@nestjs/config';
import { ActiveUserData } from './interfaces/active-user-data.interface';
import { User } from '../user.entity';
import { SendgridService } from 'src/nest/sendgrid/sendgrid.service';
import { catchError, flatMap, from, of, tap } from 'rxjs';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { TemplateKey } from 'src/nest/sendgrid/sendgrid.constants';

@Injectable()
export class AuthenticationService {

  constructor(
    private userService: UsersService,
    private hashingService: HashingService,
    private sendgridService: SendgridService,
    private configService: ConfigService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ){}

  async signUp(signUpDto: SignUpDto){
    const { email }  = signUpDto
    const password  = await this.hashingService.hash(signUpDto.password);

    const user = await this.userService.create({email, password});
    // await this.sendVerificationEmail(user)
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

  async generateTokens(user: User, expiresIn?: number) {
    const [accessToken] = await Promise.all([
      this.signToken<Partial<ActiveUserData>>(
        user.id,
        expiresIn || this.jwtConfiguration.accessTokenTtl,
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

  async sendVerificationEmail(user: User){
    const token = await this.generateTokens(user, 300)
    const link = '/auth/verify-email?token=' + token.accessToken
    return this.sendMail('SENDGRID_MAIL_VERIFICATION_TEMPLATE', link,  'sage.ts920126@gmail.com')
  }

  async sendResetPasswordEmail(email: string){
    const user = await this.userService.findOneBy({email})
    if (!user) {
      throw new UnauthorizedException('User does not exists');
    }

    const token = await this.generateTokens(user, 300)
    const link =  '/auth/reset-password?token=' + token.accessToken

    return this.sendMail('SENDGRID_RESET_PASSWORD_MAIL_TEMPLATE', link,  email)
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto){
    const { email, password } = resetPasswordDto
    const user = await this.userService.findOneBy({email})

    if (!user) {
      throw new UnauthorizedException('User does not exists');
    }

    this.userService.update(user.id, { password })
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

  private sendMail(templateKey: TemplateKey, link: string, email: string){
    const msg = {
      from: this.configService.get('SENDGRID_FROM'),
      subject: 'Reset Your password',
      templateId: this.configService.get(templateKey),
      personalizations: [
        {
          to: email,
          dynamicTemplateData: {
            link:  this.configService.get("HOST") + link
          },
        }
      ]
    };

    return this.sendgridService.send(msg)
  }
}

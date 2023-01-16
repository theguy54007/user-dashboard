import { ForbiddenException, HttpException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/nest/users/users.service';
import { HashingService } from '../hashing/hashing.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../../../../config/jwt.config';
import { ConfigService, ConfigType } from '@nestjs/config';
import { ActiveUserData } from './interfaces/active-user-data.interface';
import { User } from '../user.entity';
import { SendgridService } from 'src/nest/sendgrid/sendgrid.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { TemplateKey } from 'src/nest/sendgrid/sendgrid.constants';
import { ResetForgotPasswordDto } from './dto/reset-forgot-password.dto';
import { lastValueFrom } from 'rxjs';

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

    await this.generateTokenAndSendVerificationMail(user)
    return user;
  }

  async signIn(signInDto: SignInDto){
    const { email, password } = signInDto
    let user = await this.userService.findOneBy({email})

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

    if (!user.emailVerified) {
      throw new ForbiddenException("User's email is not verified")
    }

    const updatedAttr = {
      signInCount: user.signInCount + 1
    }
    user = await this.userService.update(user.id, updatedAttr)
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

  async sendVerificationEmail(email: string){
    const user = await this.userService.findOneBy({email})
    if (!user) {
      throw new UnauthorizedException('User does not exists');
    }

    const result = await this.generateTokenAndSendVerificationMail(user)
    return result
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

  async verifyEmail(token: string){
    try {
      const payload = await this.decryptToken(token)
      let user = await this.userService.findOne(+payload.sub);

      const updatedAttr = {
        emailVerified: true,
        signInCount: user.signInCount + 1
      }
      user = await this.userService.update(user.id, updatedAttr)
      return user
    } catch {
      throw new UnauthorizedException('token is invalid or expired, please login and resend verification email again.');
    }
  }

  async resetPassword(user: User, resetPasswordDto: ResetPasswordDto){
    const oldPassword = await this.hashingService.hash(resetPasswordDto.oldPassword);
    const isEqual = await this.hashingService.compare(
      oldPassword,
      user.password,
    );

    if (!isEqual) throw new UnauthorizedException('the old Password is invalid')

    const password  = await this.hashingService.hash(resetPasswordDto.password);
    this.userService.update(user.id, { password })
  }

  async resetForgotPassword(token: string, resetPasswordDto: ResetForgotPasswordDto){
    try {
      const payload = await this.decryptToken(token)
      const user = await this.userService.findOne(+payload.sub);
      if (!user) {
        throw new UnauthorizedException('User does not exists');
      }
      const password  = await this.hashingService.hash(resetPasswordDto.password);
      this.userService.update(user.id, { password })
    } catch {
      throw new UnauthorizedException('token is invalid or expired, please try again by submitting email at forgot password page.');
    }
  }

  private async generateTokenAndSendVerificationMail(user: User){
    const token = await this.generateTokens(user, 300)
    const link = '/auth/verify-email/' + token.accessToken
    return this.sendMail('SENDGRID_MAIL_VERIFICATION_TEMPLATE', link,  'sage.ts920126@gmail.com')
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

    return lastValueFrom(this.sendgridService.send(msg))
  }
}

import { ForbiddenException, HttpException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/nest/users/users.service';
import { HashingService } from '../hashing/hashing.service';
import { SignInDto } from './dtos/sign-in.dto';
import { SignUpDto } from './dtos/sign-up.dto';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../../../../config/jwt.config';
import { ConfigService, ConfigType } from '@nestjs/config';
import { User } from '../user.entity';
import { SendgridService } from 'src/nest/sendgrid/sendgrid.service';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { TemplateKey } from 'src/nest/sendgrid/sendgrid.constants';
import { ResetForgotPasswordDto } from './dtos/reset-forgot-password.dto';
import { lastValueFrom } from 'rxjs';
import { SessionsService } from 'src/nest/sessions/sessions.service';

@Injectable()
export class AuthenticationService {

  constructor(
    private userService: UsersService,
    private hashingService: HashingService,
    private sessionService: SessionsService,
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

    if (!user.email_verified) {
      throw new ForbiddenException("User's email is not verified")
    }

    return await this.signInUser(user)
  }

  async signOut(user_id: number){
    const session = await this.sessionService.findOneActiveBy({ user: {id: user_id }})
    this.sessionService.updateEndAt(session.id)
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

    const resetToken = await this.signToken(user.id, 300)
    const link =  '/auth/reset-password?token=' + resetToken

    return this.sendMail('SENDGRID_RESET_PASSWORD_MAIL_TEMPLATE', link,  email)
  }

  async verifyEmail(token: string){
    try {
      const payload = await this.decryptToken(token)
      let user = await this.userService.findOneBy({ id: +payload.sub });

      return await this.signInUser(user, { email_verified: true })
    } catch {
      throw new UnauthorizedException('token is invalid or expired, please login and resend verification email again.');
    }
  }

  async resetPassword(user: User, resetPasswordDto: ResetPasswordDto){
    const { oldPassword } = resetPasswordDto
    const isEqual = await this.hashingService.compare(
      oldPassword,
      user.password,
    );

    if (!isEqual) throw new UnauthorizedException('the old Password is invalid')

    const password  = await this.hashingService.hash(resetPasswordDto.password);
    await this.userService.update(user.id, { password })
    await this.signOut(user.id)
  }

  async resetForgotPassword(token: string, resetPasswordDto: ResetForgotPasswordDto){
    try {
      const payload = await this.decryptToken(token)
      const user = await this.userService.findOneBy({ id: +payload.sub });

      if (!user) {
        throw new UnauthorizedException('User does not exists');
      }

      const password  = await this.hashingService.hash(resetPasswordDto.password);
      await this.userService.update(user.id, { password })
    } catch {
      throw new UnauthorizedException('token is invalid or expired, please resend the email to try again.');
    }
  }

  async signInUser(user: User, updatedAttr?: Partial<User>){
    updatedAttr =  updatedAttr ?? {}
    const id = user.id
    const attr = {
      ...updatedAttr,
      sign_in_count: user.sign_in_count + 1
    }
    await this.userService.update(id, attr)
    user = await this.userService.findWithOauth({ id })

    const session = await this.sessionService.create({ user_id: id });
    const  accessToken  = await this.signToken(session.auth_token)
    return {
      user,
      accessToken
    }
  }

  private async generateTokenAndSendVerificationMail(user: User){
    const token = await this.signToken(user.id, 300)
    const link = '/auth/verify-email/' + token
    return this.sendMail('SENDGRID_MAIL_VERIFICATION_TEMPLATE', link,  'sage.ts920126@gmail.com')
  }

  private async signToken(
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

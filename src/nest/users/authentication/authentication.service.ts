import { ForbiddenException, Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { UsersService } from 'src/nest/users/users.service';
import { HashingService } from '../hashing/hashing.service';
import { SignInDto } from './dtos/sign-in.dto';
import { SignUpDto } from './dtos/sign-up.dto';
import { User } from '../user.entity';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { ResetForgotPasswordDto } from './dtos/reset-forgot-password.dto';
import { SessionsService } from 'src/nest/sessions/sessions.service';
import { EMAIL_NOT_VERIFIED, EMAIL_PASSWORD_INCORRECT, EMAIL_TOKEN_INVALID, PASSWORD_INVALID, SSO_LOGIN, USER_NOT_EXIST } from 'src/nest/shared/error-messages.constant';
import { TokenService } from '../token/token.service';
import { AuthMailService } from '../auth-mail/auth-mail.service';

@Injectable()
export class AuthenticationService {

  constructor(
    private readonly userService: UsersService,
    private readonly hashingService: HashingService,
    private readonly sessionService: SessionsService,
    private readonly tokenService: TokenService,
    private readonly authMailService: AuthMailService
  ){}

  async signUp(signUpDto: SignUpDto){
    const { email }  = signUpDto
    const password  = await this.hashingService.hash(signUpDto.password);

    const user = await this.userService.create({email, password});

    await this.authMailService.generateTokenAndSendVerificationMail(user)
    return user;
  }

  async signIn(signInDto: SignInDto){
    const { email, password } = signInDto
    let user = await this.userService.findWithOauth({ email })

    if (!user) {
      throw new UnauthorizedException(EMAIL_PASSWORD_INCORRECT);
    }

    if (user.oauths.length > 0) {
      throw new UnprocessableEntityException(SSO_LOGIN)
    }

    const isEqual = await this.hashingService.compare(
      password,
      user.password,
    );
    if (!isEqual) {
      throw new UnauthorizedException(EMAIL_PASSWORD_INCORRECT);
    }

    if (!user.email_verified) {
      throw new ForbiddenException(EMAIL_NOT_VERIFIED)
    }

    return await this.signInUser(user)
  }

  async signOut(id: number){
    const session = await this.sessionService.findOneActiveBy({ user: { id }})
    this.sessionService.updateEndAt(session.id)
  }

  async verifyEmail(token: string){
    try {
      const payload = await this.tokenService.decryptToken(token)
      const user = await this.userService.findOneBy({ id: +payload.sub });
      if (!user) {
        throw new UnauthorizedException(USER_NOT_EXIST);
      }

      return await this.signInUser(user, { email_verified: true })
    } catch {
      throw new UnauthorizedException(EMAIL_TOKEN_INVALID);
    }
  }

  async resetPassword(user: User, resetPasswordDto: ResetPasswordDto){
    const { originalPassword } = resetPasswordDto
    const isEqual = await this.hashingService.compare(
      originalPassword,
      user.password,
    );

    if (!isEqual) throw new UnauthorizedException(PASSWORD_INVALID)

    const password  = await this.hashingService.hash(resetPasswordDto.password);
    await this.userService.update(user.id, { password })
    await this.signOut(user.id)
  }

  async resetForgotPassword(resetPasswordDto: ResetForgotPasswordDto){
    try {
      const { resetToken } = resetPasswordDto
      const payload = await this.tokenService.decryptToken(resetToken)
      const user = await this.userService.findOneBy({ id: +payload.sub });

      if (!user) {
        throw new UnauthorizedException(USER_NOT_EXIST);
      }

      const password  = await this.hashingService.hash(resetPasswordDto.password);
      await this.userService.update(user.id, { password })
    } catch {
      throw new UnauthorizedException(EMAIL_TOKEN_INVALID);
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
    const  accessToken  = await this.tokenService.signToken(session.auth_token)
    return {
      user,
      accessToken
    }
  }
}

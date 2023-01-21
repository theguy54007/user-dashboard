import { Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { TemplateKey } from 'src/nest/sendgrid/sendgrid.constants';
import { SendgridService } from 'src/nest/sendgrid/sendgrid.service';
import { SSO_LOGIN, USER_NOT_EXIST } from 'src/nest/shared/error-messages.constant';
import { TokenService } from '../token/token.service';
import { User } from '../user.entity';
import { UsersService } from '../users.service';

@Injectable()
export class AuthMailService {

  constructor(
    private sendgridService: SendgridService,
    private userService: UsersService,
    private tokenService: TokenService
  ) {}


  async verificationMail(email: string){
    const user = await this.userService.findOneBy({email})
    if (!user) {
      throw new UnauthorizedException(USER_NOT_EXIST);
    }

    const result = await this.generateTokenAndSendVerificationMail(user)
    return result
  }

  async resetPasswordMail(email: string){
    const user = await this.userService.findWithOauth({email})
    if (!user) {
      throw new UnauthorizedException(USER_NOT_EXIST);
    }

    if (user.oauths.length > 0) {
      throw new UnprocessableEntityException(SSO_LOGIN)
    }

    const resetToken = await this.tokenService.signToken(user.id, 300)
    const link =  '/auth/reset-forgot-password/' + resetToken

    return this.sendMail('SENDGRID_RESET_PASSWORD_MAIL_TEMPLATE', link,  email)
  }

  async generateTokenAndSendVerificationMail(user: User){
    const token = await this.tokenService.signToken(user.id, 300)
    const link = '/auth/verify-email/' + token
    return this.sendMail('SENDGRID_MAIL_VERIFICATION_TEMPLATE', link,  user.email)
  }

  private sendMail(templateKey: TemplateKey, link: string, email: string){
    const msg = {
      from: process.env.SENDGRID_FROM,
      subject: 'Reset Your password',
      templateId: process.env[templateKey],
      personalizations: [
        {
          to: email,
          dynamicTemplateData: {
            link:  process.env.HOST + link
          },
        }
      ]
    };

    return lastValueFrom(this.sendgridService.send(msg))
  }

}

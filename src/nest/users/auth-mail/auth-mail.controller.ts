import { Body, Controller, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { MessageResponseDto } from 'src/nest/dtos/message-response.dto';
import { BAD_REQUEST, USER_NOT_EXIST } from 'src/nest/shared/error-messages.constant';
import { SENT_RESET_PASSWORD_MAIL, SENT_VERIFICATION_MAIL } from '../authentication/constants/response-message.constant';
import { SendEmailDto } from '../authentication/dtos/send-email.dto';
import { AuthMailService } from './auth-mail.service';

@Controller('auth-mail')
@ApiTags('Auth Mail')
export class AuthMailController {

  constructor(
    private authMailService: AuthMailService
  ){}

  @Post('/verification-mail')
  @ApiOperation({
    description: 'send the verification email with confimation link to user.'
  })
  @ApiResponse({
    status: 201,
    type: MessageResponseDto,
    description: SENT_VERIFICATION_MAIL
  })
  @ApiUnauthorizedResponse({
    description: USER_NOT_EXIST
  })
  @ApiBadRequestResponse({
    description: BAD_REQUEST
  })
  async sendEmailVerify(@Body() body: SendEmailDto){
    await this.authMailService.verificationMail(body.email)
    return { message: SENT_VERIFICATION_MAIL}
  }

  @Post('/reset-password-mail')
  @ApiOperation({
    description: 'send the email with reset password link to user'
  })
  @ApiResponse({
    status: 201,
    type: MessageResponseDto,
    description: SENT_RESET_PASSWORD_MAIL
  })
  @ApiBadRequestResponse({
    description: BAD_REQUEST
  })
  @ApiUnauthorizedResponse({
    description: [
      USER_NOT_EXIST
    ].join(' / ')
  })
  async sendResetPasswordMail(@Body() body: SendEmailDto){
    await this.authMailService.resetPasswordMail(body.email)
    return { message: SENT_RESET_PASSWORD_MAIL }
  }
}

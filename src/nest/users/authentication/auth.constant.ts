import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';

const configService = new ConfigService()

export const accessTokenCookieOptions = {
  httpOnly: true,
  expires: moment().add(+configService.get('JWT_ACCESS_TOKEN_TTL'), 'milliseconds').toDate()
}

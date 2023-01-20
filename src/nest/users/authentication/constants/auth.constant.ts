import * as moment from 'moment';

export const accessTokenCookieOptions = {
  httpOnly: true,
  expires: moment().add(+process.env.JWT_ACCESS_TOKEN_TTL, 'milliseconds').toDate()
}

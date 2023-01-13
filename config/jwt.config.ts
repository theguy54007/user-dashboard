import { ConfigService, registerAs } from "@nestjs/config";
import { config } from 'dotenv';

config({
  path: process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env'
})

const configService = new ConfigService();

export default registerAs('jwt', () => {
  return {
    secret: configService.get("JWT_SECRET"),
    audience: configService.get("JWT_TOKEN_AUDIENCE"),
    issuer: configService.get("JWT_TOKEN_ISSUER"),
    accessTokenTtl: parseInt(configService.get("JWT_ACCESS_TOKEN_TTL") ?? '3600', 10),
    refreshTokenTtl: parseInt(configService.get("JWT_REFRESH_TOKEN_TTL") ?? '86400', 10)
  };
});

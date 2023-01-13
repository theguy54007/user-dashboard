import { ConfigService, registerAs } from "@nestjs/config";
import { config } from 'dotenv';

config({
  path: process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env'
})

const configService = new ConfigService();

export default registerAs('sendgrid', () => ({
  apiKey: configService.get("SENDGRID_API_KEY") || 'SG.test',
}));

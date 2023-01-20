import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';

config({
  path: process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env',
});

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: configService.get<string>('PGHOST'),
  port: +configService.get<string>('PGPORT'),
  username: configService.get<string>('PGUSER'),
  password: configService.get<string>('PGPASSWORD'),
  database: configService.get<string>('PGDATABASE'),
  entities: ['./src/nest/**/*.entity.ts'],
  migrations: ['./migrations/*.ts'],
});

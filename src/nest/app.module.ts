import { MiddlewareConsumer, Module, RequestMethod, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { SendgridModule } from './sendgrid/sendgrid.module';
import { SessionsModule } from './sessions/sessions.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

const cookieSession = require('cookie-session')

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env'
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          type: 'postgres',
          database: config.get<string>('PGDATABASE'),
          username: config.get<string>('PGUSER'),
          password: config.get<string>('PGPASSWORD'),
          host: config.get<string>('PGHOST'),
          port: config.get<number>('PGPORT'),
          synchronize: false,
          autoLoadEntities: true
        }
      }
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..','..','..','frontend'),
    }),

    UsersModule,
    SendgridModule,
    SessionsModule,
  ],
  controllers: [
    AppController
  ],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
      })
    }
  ],
})
export class AppModule {
  constructor(
    private configService: ConfigService
  ){}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(
      cookieSession({
        keys: [this.configService.get('COOKIE_KEY')]
      }),
    ).forRoutes({
      path: "/**",
      method: RequestMethod.ALL
    })
  }
}

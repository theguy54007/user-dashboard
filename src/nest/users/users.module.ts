import { MiddlewareConsumer, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { AuthenticationController } from 'src/nest/users/authentication/authentication.controller';
import { HashingService } from 'src/nest/users/hashing/hashing.service';
import { BcryptService } from 'src/nest/users/hashing/bcrypt.service';
import { AuthenticationService } from 'src/nest/users/authentication/authentication.service';
import jwtConfig from '../../../config/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { CurrentUserMiddleware } from './middlewares/current-user.middleware';
import { SendgridModule } from 'src/nest/sendgrid/sendgrid.module';
import { Session } from '../sessions/session.entity';
import { SessionsService } from '../sessions/sessions.service';
import { OauthService } from './authentication/oauth/oauth.service';
import { OauthController } from './authentication/oauth/oauth.controller';
import { Oauth } from './authentication/oauth/oauth.entity';
import { FacebookAuthModule } from 'facebook-auth-nestjs';
import { AuthMailController } from './auth-mail/auth-mail.controller';
import { AuthMailService } from './auth-mail/auth-mail.service';
import { TokenService } from './token/token.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env'
    }),
    TypeOrmModule.forFeature(
      [
        User,
        Session,
        Oauth
      ]
    ),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    FacebookAuthModule.forRoot({
      clientId: +process.env.FB_CLIENT_ID,
      clientSecret: process.env.FB_CLIENT_SECRET,
    }),
    SendgridModule
  ],
  controllers: [
    UsersController,
    AuthenticationController,
    OauthController,
    AuthMailController
  ],
  providers: [
    {
      provide: HashingService,
      useClass: BcryptService
    },
    UsersService,
    AuthenticationService,
    SessionsService,
    OauthService,
    AuthMailService,
    TokenService
  ]
})
export class UsersModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).forRoutes('*');
  }
}

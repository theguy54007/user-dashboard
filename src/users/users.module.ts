import { MiddlewareConsumer, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { AuthenticationController } from 'src/users/authentication/authentication.controller';
import { HashingService } from 'src/users/hashing/hashing.service';
import { BcryptService } from 'src/users/hashing/bcrypt.service';
import { AuthenticationService } from 'src/users/authentication/authentication.service';
import jwtConfig from '../../config/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { CurrentUserMiddleware } from './middlewares/current-user.middleware';
import { SendgridModule } from 'src/sendgrid/sendgrid.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    SendgridModule
  ],
  controllers: [
    UsersController,
    AuthenticationController
  ],
  providers: [
    {
      provide: HashingService,
      useClass: BcryptService
    },
    UsersService,
    AuthenticationService
  ]
})
export class UsersModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).forRoutes('*');
  }
}

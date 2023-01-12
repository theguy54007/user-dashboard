import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { AuthenticationController } from 'src/users/authentication/authentication.controller';
import { HashingService } from 'src/users/hashing/hashing.service';
import { BcryptService } from 'src/users/hashing/bcrypt.service';
import { AuthenticationService } from 'src/users/authentication/authentication.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
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
export class UsersModule {}

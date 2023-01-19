import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, Request, NotFoundException, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { Serialize } from 'src/nest/interceptors/serialize.interceptor';
import { UserDto } from './dtos/user.dto';
import { AuthGuard } from 'src/nest/guards/auth.guard';
import { CurrentUser } from './decorator/current-user.decorator';
import { UserListDto } from './dtos/user-list.dto';
import { UserStatistic } from './dtos/user-statistic.dto';
import { ApiForbiddenResponse, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { LOGIN_REQUIRE, USER_NOT_EXIST } from '../shared/error-messages.constant';

@Controller('users')
@UseGuards(AuthGuard)
@ApiTags('Users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/with-last-session-at')
  @ApiOperation({
    description: "Fetch user list \n * Required to be logged in via `auth/sign-in` API"
  })
  @ApiResponse({
    status: 200,
    type: UserListDto
  })
  @ApiForbiddenResponse({
    description: LOGIN_REQUIRE
  })
  @Serialize(UserListDto)
  withLastSessionAt() {
    return this.usersService.findAllWIthLastSessionAt();
  }

  @Get('/statistic')
  @ApiOperation({
    description: "Fetch user statistic data \n * Required to be logged in via `auth/sign-in` API"
  })
  @ApiResponse({
    status: 200,
    type: UserStatistic
  })
  @ApiForbiddenResponse({
    description: LOGIN_REQUIRE
  })
  @Serialize(UserStatistic)
  statistic(){
    return this.usersService.statistic()
  }

  @Get('/current-user')
  @ApiOperation({
    description: 'Get current signed in user data \n * Required to be logged in via `auth/sign-in` API'
  })
  @ApiResponse({
    status: 200,
    type: UserDto
  })
  @ApiForbiddenResponse({
    description: LOGIN_REQUIRE
  })
  @Serialize(UserDto)
  getCurrentUser(@CurrentUser() user){
    return user
  }

  @Patch('/user')
  @ApiOperation({
    description: "update user data \n * Required to be logged in via `auth/sign-in` API"
  })
  @ApiResponse({
    status: 200,
    type: UserDto
  })
  @ApiUnauthorizedResponse({
    description: USER_NOT_EXIST
  })
  @ApiForbiddenResponse({
    description: LOGIN_REQUIRE
  })
  @Serialize(UserDto)
  update(@Body() updateUserDto: UpdateUserDto, @CurrentUser() user) {
    return this.usersService.update(user.id, updateUserDto);
  }

}

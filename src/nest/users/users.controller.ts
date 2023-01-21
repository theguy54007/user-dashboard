import { Controller, Get, Body, Patch, UseGuards, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { Serialize } from 'src/nest/interceptors/serialize.interceptor';
import { UserDto } from './dtos/user.dto';
import { AuthGuard } from 'src/nest/guards/auth.guard';
import { CurrentUser } from './decorator/current-user.decorator';
import { UserStatistic } from './dtos/user-statistic.dto';
import { ApiForbiddenResponse, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { LOGIN_REQUIRE, USER_NOT_EXIST } from '../shared/error-messages.constant';
import { PaginationQueryDto } from '../dtos/pagination-query.dto';
import { ListWithLastSessionDto } from './dtos/list-with-last-session.dto';

@Controller('users')
@UseGuards(AuthGuard)
@ApiTags('Users')
export class UsersController {

  constructor(private readonly usersService: UsersService) {}


  @Get('/with-last-session-at')
  @ApiOperation({
    description: "<b>Required to be logged in via `auth/sign-in` API</b> \n \n Fetch user list, each user will have \n 1. Timestamp of user sign up. \n 2. Number of times logged in. \n 3. Timestamp of the last user session \n"
  })
  @ApiResponse({
    status: 200,
    type: ListWithLastSessionDto,
    isArray: true
  })
  @ApiForbiddenResponse({
    description: LOGIN_REQUIRE
  })
  @Serialize(ListWithLastSessionDto)
  withLastSessionAt(@Query() query: PaginationQueryDto) {
    return this.usersService.findAllWIthLastSessionAt(query);
  }

  @Get('/statistic')
  @ApiOperation({
    description: "<b>Required to be logged in via `auth/sign-in` API</b> \n \n Fetch user statistic data:  \n 1. Total number of users who have signed up. \n 2. Total number of users with active sessions today. \n 3. Average number of active session users in the last 7 days rolling."
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
    description: "update user's name \n * Required to be logged in via `auth/sign-in` API"
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

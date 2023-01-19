import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, Request, NotFoundException, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { Serialize } from 'src/nest/interceptors/serialize.interceptor';
import { UserDto } from './dtos/user.dto';
import { AuthGuard } from 'src/nest/guards/auth.guard';
import { CurrentUser } from './decorator/current-user.decorator';
import { UserListDto } from './dtos/user-list.dto';
import { UserStatistic } from './dtos/user-statistic.dto';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Serialize(UserListDto)
  findAll() {
    return this.usersService.findAll();
  }

  @Get('/with-last-session-at')
  @Serialize(UserListDto)
  withLastSessionAt() {
    return this.usersService.findAllWIthLastSessionAt();
  }

  @Get('/statistic')
  @Serialize(UserStatistic)
  statistic(){
    return this.usersService.statistic()
  }

  @Get('/current-user')
  @Serialize(UserDto)
  getCurrentUser(@CurrentUser() user){
    return user
  }

  @Patch('/user')
  @Serialize(UserDto)
  update(@Body() updateUserDto: UpdateUserDto, @CurrentUser() user) {
    return this.usersService.update(user.id, updateUserDto);
  }

}

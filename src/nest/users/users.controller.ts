import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, Request, NotFoundException, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Serialize } from 'src/nest/interceptors/serialize.interceptor';
import { UserDto } from './dtos/user.dto';
import { AuthGuard } from 'src/nest/guards/auth.guard';
import { CurrentUser } from './decorator/current-user.decorator';
import { UserListDto } from './dtos/user-list.dto';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Serialize(UserListDto)
  findAll() {
    return this.usersService.findAll();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.usersService.findOne(+id);
  // }

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

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.usersService.remove(+id);
  // }
}

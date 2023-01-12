import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, Request, NotFoundException, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUserInterceptor } from './interceptors/current-user.interceptor';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { UserDto } from './dtos/user.dto';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('users')
@UseInterceptors(CurrentUserInterceptor)
@Serialize(UserDto)
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.usersService.findOne(+id);
  // }

  @Get('/me')
  getMe(@Request() req){
    return req.currentUser
  }

  @Patch('/user')
  update(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.currentUser.id, updateUserDto);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.usersService.remove(+id);
  // }
}

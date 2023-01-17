import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../users/decorator/current-user.decorator';
import { User } from '../users/user.entity';
import { CreateSessionDto } from './dtos/create-session.dto';
import { SessionsService } from './sessions.service';

@Controller('session')
@UseGuards(AuthGuard)
export class SessionsController {

  constructor(
    private sessionService: SessionsService
  ){}

  @Post()
  createSession(@Body() body: Partial<CreateSessionDto>, @CurrentUser() user: User){
    const user_id = user.id
    return this.sessionService.create(Object.assign(body, { user_id }))
  }
}

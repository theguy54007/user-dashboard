import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import * as moment from 'moment';
import { MoreThan, Repository } from 'typeorm';
import { CreateSessionDto } from './dtos/create-session.dto';
import { Session } from './session.entity';

interface SessionQuery {
  user?: {id: number};
  auth_token?: string;
}

@Injectable()
export class SessionsService {

  constructor(
    @InjectRepository(Session) private repo: Repository<Session>
  ){}

  async create(sessionAttr: CreateSessionDto){
    // invalidating old session
    const { user_id: id } = sessionAttr
    const oldSession = await this.findOneActiveBy({
      user: { id }
    })
    if (oldSession) {
      this.updateEndAt(oldSession.id)
    }

    const session = this.repo.create({
      user: { id },
      auth_token: randomUUID(),
      end_at: this.newDateTime({ms: +process.env.JWT_ACCESS_TOKEN_TTL})
    })
    return this.repo.save(session)
  }

  findOneActiveBy(query: SessionQuery){
    const activeQuery = this.withActiveQuery(query)
    return this.repo.findOneBy(activeQuery)
  }

  async update(id: number, sessionAttr: Partial<Session>) {
     const session = await this.findOneBy(id)
    if (!session) throw new NotFoundException('session not found')

    Object.assign(session, sessionAttr);
    return this.repo.save(session);
  }

  updateEndAt(id: number){
    return this.update(id, {end_at: this.newDateTime()})
  }

  findOneBy(id: number) {
    return this.repo.findOneBy({id: id})
  }

  private withActiveQuery(query: SessionQuery){
    return Object.assign(
      query,
      { end_at: MoreThan( this.newDateTime() ) }
    )
  }

  newDateTime(options?: {day?: number, ms?: number}){
    const {day, ms} = options || {}

    let momentDate = moment()

    if (ms) {
      momentDate = momentDate.add(ms,'milliseconds')
    } else if (day){
      momentDate = momentDate.add(day, 'd')
    }

    return momentDate.toDate()
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './session.entity';

@Injectable()
export class SessionsService {

  constructor(
    @InjectRepository(Session) private repo: Repository<Session>
  ){}

  async create(sessionAttr: Partial<Session>){
    try{
      return await this.repo.save(sessionAttr)
    } catch(err) {
      console.error(err)
    }
  }
}

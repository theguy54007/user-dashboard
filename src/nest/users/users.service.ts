import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from '../sessions/session.entity';
import { User } from './user.entity';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    @InjectRepository(Session) private sessionRepo: Repository<Session>
  ){}

  async create(userAttr: Partial<User>) {
    try {
      return await this.repo.save(userAttr);
    } catch (err) {
      const pgUniqueViolationErrorCode = '23505';
      if (err.code === pgUniqueViolationErrorCode) {
        throw new ConflictException('email is already been used, please try another email');
      }
      throw err;
    }
  }

  findOneBy(query: UserQuery){
    return this.repo.findOneBy(query);
  }

  findAll() {
    return this.repo.createQueryBuilder()
                    .getMany()

  }

  findOne(id: number) {
    return this.repo.findOneBy({id: id})
  }

  async update(id: number, attrs: Partial<User>){
    const user = await this.findOne(id)
    if (!user) throw new NotFoundException('user not found');

    Object.assign(user, attrs);
    return this.repo.save(user);
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async findAllWIthLastSessionAt(){
    const query = this.repo
      .createQueryBuilder('u')
      .select(['id','email', 'name', 'sign_in_count', 'created_at', 's.last_session_at'])
      .leftJoin(
        subQuery => {
          return subQuery
            .select('user_id, max(created_at) as last_session_at')
            .from('sessions', 's')
            .groupBy('user_id');
        },
        's',
        'u.id = s.user_id'
      ).orderBy("created_at")

    return await query.getRawMany();
  }

  userStatistic(){
    // Total number of users who have signed up.
    // Total number of users with active sessions today.
    // Average number of active session users in the last 7 days rolling.

  }
}


interface UserQuery {
  email?: string;
}

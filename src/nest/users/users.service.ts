import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { MoreThan, Repository } from 'typeorm';
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

  async findOneBySession(auth_token: string){
    const user = await this.repo.findOne({
      relations: ['sessions'],
      where: {
        sessions: {
          auth_token,
          end_at: MoreThan( moment().toDate() )
        }
      }
    })
    return user
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

  async statistic(){
    // Total number of users who have signed up.
    const total = await this.repo.count()

    // Total number of users with active sessions today.
    const activeToday = await this.getActiveUsersToday()

    // Average number of active session users in the last 7 days rolling.
    const average7day = await this.getAvgActiveUsersLast7Days()

    return {
      total,
      activeToday,
      average7day
    }
  }

  private async getActiveUsersToday(){
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const endOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
    );

    const activeUsers = await this.sessionRepo
      .createQueryBuilder('session')
      .select('COUNT(DISTINCT session.user_id)', 'count')
      .where('session.end_at > :today', {today})
      .andWhere('session.created_at BETWEEN :startOfToday AND :endOfToday', { startOfToday, endOfToday })
      .getRawOne();

    return +activeUsers.count;
  }

  private async getAvgActiveUsersLast7Days(){

    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activeUsers = await this.sessionRepo.createQueryBuilder('session')
      .select('COUNT(DISTINCT session.user_id)', 'activeUsers')
      .addSelect('Date(session.end_at)', 'end_day')
      .where('session.end_at BETWEEN :sevenDaysAgo and :today', { today, sevenDaysAgo })
      .groupBy('end_day')
      .getRawMany();

    const avgActiveUsers = activeUsers.reduce((sum, row) => sum + +row.activeUsers, 0)/7
    return avgActiveUsers;
  }
}


interface UserQuery {
  email?: string;
}

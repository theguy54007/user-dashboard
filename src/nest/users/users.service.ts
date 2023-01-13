import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User) private repo: Repository<User>
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
}


interface UserQuery {
  email?: string;
}

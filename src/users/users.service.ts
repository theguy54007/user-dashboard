import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SignUpDto } from 'src/users/authentication/dto/sign-up.dto/sign-up.dto';
import { HashingService } from 'src/users/hashing/hashing.service';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    // private hashingService: HashingService
  ){}

  async create(signUpDto: SignUpDto) {
    try {
      return await this.repo.save(signUpDto);
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
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}


interface UserQuery {
  email?: string;
}

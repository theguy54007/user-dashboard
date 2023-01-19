import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { FacebookAuthService } from 'facebook-auth-nestjs';
import { OAuth2Client } from 'google-auth-library';
import { Repository } from 'typeorm';
import { User } from '../../user.entity';
import { AuthenticationService } from '../authentication.service';
import { Oauth } from './oauth.entity';

interface HandleOauth {
  auth_id: string,
  email: string,
  name: string,
  source: string
}


@Injectable()
export class OauthService {
  private oauthClient: OAuth2Client;

  constructor(
    private configService: ConfigService,
    private authService: AuthenticationService,
    private facebookService: FacebookAuthService,
    @InjectRepository(Oauth) private repo: Repository<Oauth>,
    @InjectRepository(User) private userRepo: Repository<User>
  ){}

   onModuleInit() {
    const clientId = this.configService.get('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');
    this.oauthClient = new OAuth2Client(clientId, clientSecret);
  }

  async googleAuth(idToken: string) {
    try {
      const loginTicket = await this.oauthClient.verifyIdToken({
        idToken
      });
      const { email, sub: auth_id, name } = loginTicket.getPayload();

      return await this.handleOauth({
        email,
        auth_id,
        name,
        source: 'google'
      })
    } catch (err) {
      const pgUniqueViolationErrorCode = '23505';
      if (err.code === pgUniqueViolationErrorCode) {
        throw new ConflictException();
      }
      throw new UnauthorizedException();
    }
  }

  async facebookAuth(accessToken: string){
    try {
      const {name, email, id: auth_id} = await this.facebookService.getUser(accessToken, 'name', 'email', 'id')

      return await this.handleOauth({
        email,
        auth_id,
        name,
        source: 'fb'
      })
    } catch {
      throw new UnauthorizedException('invalid accessToken')
    }
  }

  private async handleOauth(body: HandleOauth){
    const {auth_id, email, name, source} = body

    let oauth =  await this.repo.findOne({
      where: {
        auth_id,
        source
      },
      relations: {user: true}
    })

    if (!oauth) {
      let user = await this.userRepo.findOneBy({email})

      if (user) {
        await this.userRepo.update(user.id, { email_verified: true});
      } else {
        user = await this.userRepo.save({ email, name, email_verified: true})
      }

      const newOauth = this.repo.create({
        user,
        auth_id,
        source
      })
      oauth = await this.repo.save(newOauth)
    }

    return this.authService.signInUser(oauth.user)
  }
}

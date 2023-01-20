import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FacebookAuthService } from 'facebook-auth-nestjs';
import { OAuth2Client } from 'google-auth-library';
import { INVALID_FB_TOKEN, INVALID_GOOGLE_TOKEN } from 'src/nest/shared/error-messages.constant';
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
    private authService: AuthenticationService,
    private facebookService: FacebookAuthService,
    @InjectRepository(Oauth) private repo: Repository<Oauth>,
    @InjectRepository(User) private userRepo: Repository<User>
  ){}

   onModuleInit() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
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
    } catch {
      throw new UnauthorizedException(INVALID_GOOGLE_TOKEN);
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
      throw new UnauthorizedException(INVALID_FB_TOKEN)
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

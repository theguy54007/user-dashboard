import { Injectable } from '@angular/core';
import { ApiService } from './api.service';


@Injectable({
  providedIn: 'root'
})
export class AuthMailService {

  constructor(
    private apiService: ApiService,
  ) { }


  sendVerificationMail(email: string){
    return this.apiService.post('auth-mail/verification-mail', { email })
  }


  sendResetPasswordMail(email: string){
    return this.apiService.post('auth-mail/reset-password-mail', { email })
  }
}

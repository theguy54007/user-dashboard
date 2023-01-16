import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, tap } from 'rxjs';
import { User } from '../model/user/user.model';
import { ApiService } from './api.service';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user = new BehaviorSubject<User>(null);

  constructor(
    private apiService: ApiService,
    private localStorage: LocalStorageService,
    private router: Router
  ) { }

  signIn(body: SignIn){
    return this.apiService.post('auth/sign-in', body).pipe(
      tap(data => {
        const { user } = data
        if (user) {
          this.addNewUser(user)
        }
      })
    )
  }

  signUp(body: SignUp){
    return this.apiService.post('auth/sign-up', body)
  }

  signOut(){
    return this.apiService.post('auth/sign-out').pipe(
      tap( _ => {
        this.logout()
      })
    )
  }

  sendVerificationMail(email: string){
    return this.apiService.post('auth/send-email-verification', { email })
  }

  verifyEmail(verifyToken: string){
    return this.apiService.post('auth/verify-email', {
      verifyToken
    })
  }

  sendResetPasswordMail(email: string){
    return this.apiService.post('auth/send-reset-password-mail', { email })
  }

  resetForgotPassword(body: ResetForgotPassword, token: string){
    const options = {headers: new HttpHeaders()};
    options.headers = options.headers.set('reset-token', token)
    return this.apiService.post('auth/reset-forgot-password', body, options)
  }

  resetPassword(body: ResetPassword){
    return this.apiService.post('auth/reset-password', body)
  }

  autoSignIn(){
    const userData: User = JSON.parse(localStorage.getItem('userData'))
    if (!userData) {
      return;
    }

    this.user.next(new User(userData))
  }

  addNewUser(user){
    this.localStorage.setItem('userData', JSON.stringify(user))
    this.user.next(new User(user))
  }

  redirectToLogin(options: {message?: string, errorMessage?: string}){
    this.router.navigate(['auth', 'sign-in'], {state: options})
  }

  logout(){
    this.localStorage.removeItem('userData')
  }
}


interface SignUp {
  email: string;
  password: string;
  passwordConfirmation: string;
}

interface SignIn extends Pick<SignUp, 'email'|'password'> {}


interface ResetForgotPassword extends Pick<SignUp, 'password'|'passwordConfirmation'> {}

interface ResetPassword extends ResetForgotPassword {
  oldPassword: string
}

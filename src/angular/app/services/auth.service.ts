import { FacebookLoginProvider, SocialAuthService } from '@abacritt/angularx-social-login';
import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, finalize, map, of, tap } from 'rxjs';
import { User } from '../model/user/user.model';
import { ApiService } from './api.service';
import { UserService } from './user.service';

interface SignUp {
  email: string;
  password: string;
  passwordConfirmation: string;
}

interface SignIn extends Pick<SignUp, 'email'|'password'> {}


interface ResetForgotPassword extends Pick<SignUp, 'password'|'passwordConfirmation'> {}

interface ResetPassword extends ResetForgotPassword {
  originalPassword: string
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user = new BehaviorSubject<User>(null);

  constructor(
    private apiService: ApiService,
    private userService: UserService,
    private router: Router,
    private socialService: SocialAuthService
  ) { }

  signIn(body: SignIn){
    return this.apiService.post('auth/sign-in', body).pipe(
      tap(data => this.handleAfterSignIn(data))
    )
  }

  googleLogin(idToken: string){
    return this.apiService.post('oauth/google', { idToken }).pipe(
      tap(data => this.handleAfterSignIn(data))
    )
  }

  facebookLogin(accessToken: string){
    return this.apiService.post('oauth/facebook', { accessToken }).pipe(
      tap(data => this.handleAfterSignIn(data))
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

  verifyEmail(verifyToken: string){
    const options = {headers: new HttpHeaders()};
    options.headers = options.headers.set('verify-token', verifyToken)
    return this.apiService.post('auth/verify-email', options)
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
    return this.userService.getCurrentUser().pipe(
      map((user: User) => {
        this.addNewUser(user)
        return user
      }),
      catchError(_ => {
        this.addNewUser(null)
        const user = this.user.getValue()
        return of(user)
      }),
      finalize(()=>{ return this.user.getValue()})
    )
  }

  addNewUser(user){
    this.user.next(new User(user))
  }

  redirectToLogin(){
    this.router.navigate(['auth', 'sign-in'])
  }

  logout(){
    const user = this.user.getValue()

    if (user.isOauth) {
      this.socialService.signOut()
    }
    this.user.next(null)
  }

  signInWithFB(){
    this.socialService.signIn(FacebookLoginProvider.PROVIDER_ID)
  }

  subscribeAuthState(){
    return this.socialService.authState
  }

  private handleAfterSignIn(data){
    const { user } = data
    if (user) {
      this.addNewUser(user)
    }
  }
}

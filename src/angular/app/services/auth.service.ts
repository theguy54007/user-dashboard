import { FacebookLoginProvider, SocialAuthService } from '@abacritt/angularx-social-login';
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


interface ResetForgotPassword extends Pick<SignUp, 'password'|'passwordConfirmation'> {
  resetToken: string
}

interface ResetPassword extends Pick<SignUp, 'password'|'passwordConfirmation'> {
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
    return this.apiService.post('auth/verify-email', { verifyToken })
  }

  resetForgotPassword(body: ResetForgotPassword){
    return this.apiService.post('auth/reset-forgot-password', body)
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
      catchError(e => {
        this.addNewUser(null)
        return of(null)
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

    if (user?.isOauth) {
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

  private handleAfterSignIn(user){
    if (user) {
      this.addNewUser(user)
    }
  }
}

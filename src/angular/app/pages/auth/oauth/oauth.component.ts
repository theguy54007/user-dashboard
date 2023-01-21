import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/angular/app/services/auth.service';

@Component({
  selector: 'app-oauth',
  templateUrl: './oauth.component.html',
  styleUrls: ['./oauth.component.scss']
})
export class OauthComponent implements OnInit, OnDestroy {

  oauthLoginSub: Subscription
  @Output() signInDone = new EventEmitter<boolean>(false);

  constructor(
    private readonly authService: AuthService
  ) { }

  ngOnInit(): void {
    this.oauthLoginSub = this.authService.subscribeAuthState().subscribe({
      next: (user) => {
        if (!user ) {
          return this.authService.signOut()
        }

        const {provider, idToken, authToken} = user

        switch (provider) {
          case 'FACEBOOK':
            return this.authService.facebookLogin(authToken).subscribe({
              next: _ => {
                this.signInDone.emit(true)
              },
              error: _ => {}
            })
          case 'GOOGLE':
            return this.authService.googleLogin(idToken).subscribe({
              next: _ => {
                this.signInDone.emit(true)
              }
            })
        }
      }
    })
  }

  ngOnDestroy(): void {
    this.oauthLoginSub.unsubscribe()
  }

  signInWithFB(){
    this.authService.signInWithFB()
  }

}

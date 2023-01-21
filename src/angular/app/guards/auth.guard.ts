import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree} from '@angular/router';
import { map, Observable, of, switchMap, take } from 'rxjs';
import { User } from '../model/user/user.model';
import { AuthService } from '../services/auth.service';
import { ToastrNoticeService } from '../services/toastr-notice.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly toastrNotice: ToastrNoticeService
  ){}

  canActivate():Observable<boolean | UrlTree> {
    return this.authService.user.pipe(
      take(1),
      switchMap(user => {
        if (user) {
          return of(true);
        } else {
          return this.authService.autoSignIn().pipe(
            map((signedInUser: User) => {
              if (signedInUser && signedInUser.email) {
                return true;
              } else {
                this.toastrNotice.addMessage({error: 'please login before you proceed'})
                return this.router.createUrlTree(['/auth','sign-in']);
              }
            })
          );
        }
      })
    );
  }

}

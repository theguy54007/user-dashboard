import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, take, switchMap, of, map } from 'rxjs';
import { User } from '../model/user/user.model';
import { AuthService } from '../services/auth.service';
import { ToastrNoticeService } from '../services/toastr-notice.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastrNotice: ToastrNoticeService
  ){}

  canActivate():Observable<boolean | UrlTree> | UrlTree{
    return this.authService.user.pipe(
      take(1),
      switchMap((user: User) => {
        if (user && user.email) {
          this.toastrNotice.addMessage({notice: 'You already login.'})
          return of(this.router.createUrlTree(['/']));
        }
        return this.authService.autoSignIn().pipe(
          map((signedInUser: User) => {
            if (signedInUser && signedInUser.email) {
              this.toastrNotice.addMessage({notice: 'You already login.'})
              return this.router.createUrlTree(['/']);;
            }
            return true;
          })
        );
      })
    );
  }

}

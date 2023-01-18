import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree} from '@angular/router';
import { map, Observable, of, switchMap, take } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastrNoticeService } from '../services/toastr-notice.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastrNotice: ToastrNoticeService
  ){}

  canActivate():Observable<boolean | UrlTree> {

    return this.authService.user.pipe(
      switchMap(user => {
        if (!user) {
          return this.authService.autoSignIn().pipe(
            take(1),
            map(user => {
              // console.log(user)
              const isAuth = !!user;
              if (isAuth){
                return true;
              }
              this.toastrNotice.addMessage({error: 'please login before you proceed'})
              return this.router.createUrlTree(['/auth','sign-in']);
            }),
          )
        }
        return of(!!user)
      })

    )
  }

}

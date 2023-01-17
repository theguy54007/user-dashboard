import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from './services/auth.service';
import { SessionService } from './services/session.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'user-dashboard';

  constructor(
    private authService: AuthService,
    private sessionService: SessionService,
    private router: Router,
  ){}

  ngOnInit(){
    this.router.events.subscribe( ev => {
      if (ev instanceof NavigationEnd) {
        const paths = ev.url.split('/')

        if (!paths.includes('auth')) {
          this.sessionService.createSession(paths[(paths.length - 1)]).subscribe({
            error: (err: HttpErrorResponse) => {
              if (err.status === 403) {
                this.authService.redirectToLogin({errorMessage: 'please login before you proceed.'})
              }
            }
          })
        }

      }
    })
  }

}

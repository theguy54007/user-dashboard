import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/angular/app/services/auth.service';
import { ToastrNoticeService } from 'src/angular/app/services/toastr-notice.service';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss']
})
export class VerifyEmailComponent implements OnInit {

  constructor(
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly toastrNotice: ToastrNoticeService
  ) { }

  ngOnInit(): void {
    const token = this.route.snapshot.params['token']

    this.authService.verifyEmail(token).subscribe({
      next: d => {
        const { user } = d
        if (user) this.authService.addNewUser(user)

        this.toastrNotice.addMessage({success: 'verified and login successfully!' })
        this.router.navigate(['/'])
      },
      error: (err: HttpErrorResponse) => {
        const { message } = err.error || {}

        if (message) {
          this.toastrNotice.addMessage( { error: message } )
          this.authService.redirectToLogin()
        }
      }
    })
  }

}

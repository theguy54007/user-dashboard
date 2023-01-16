import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/angular/app/services/auth.service';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss']
})
export class VerifyEmailComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    const token = this.route.snapshot.params['token']
    this.authService.verifyEmail(token).subscribe({
      next: d => {
        const { user } = d
        if (user) this.authService.addNewUser(user)
        this.router.navigate(['/'], {state: { message: 'verified and login successfully!' }})
      },
      error: (err: HttpErrorResponse) => {
        const errorMessage = err.error?.message
        if (errorMessage) {
          this.authService.redirectToLogin({errorMessage})
        }
      }
    })
  }

}

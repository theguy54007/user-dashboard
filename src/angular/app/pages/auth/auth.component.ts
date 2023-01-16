import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { AuthFormType } from '../../shared/auth-form/auth-form.component';


@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  formType: AuthFormType = 'login'
  showVerifiedMailNotice: boolean = false;
  hiddenSubmit: boolean = false;
  resendMailCount: number = 0;
  email: string
  currentPath = this.route.snapshot.url[0].path

  constructor(
    private authService: AuthService,
    private toastrService: ToastrService,
    private route: ActivatedRoute,
    private router: Router
  ) {

    const { errorMessage, message } = this.router.getCurrentNavigation()?.extras?.state || {}

    if (message) {
      this.toastrService.info(message)
    }

    if (errorMessage) {
      this.toastrService.error(errorMessage)
    }

  }

  ngOnInit(): void {
    if (this.currentPath === 'sign-up') {
      this.formType = 'register'
    }
  }

  onSwitchMode(type: AuthFormType){
    this.formType = type
  }

  resendMail(){
    if (this.resendMailCount > 3 || !this.email) return
    this.authService.sendVerificationMail(this.email).subscribe({
      next: (res) => {
        this.toastrService.success(res.message)
        this.showVerifiedMailNotice = true
        this.resendMailCount += 1
      }
    })
  }

  onSubmit(form: FormGroup){
    const { email, password, passwordConfirmation } = form.value;
    form.reset();

    switch (this.formType) {
      case 'login':
        return this.authService.signIn({email, password}).subscribe({
          next: (res) => {
            if (!res.user) {
              this.toastrService.error('something went wrong please try later.')
            }

            this.toastrService.success('login successfully!')
            this.router.navigate([''])
          },
          error: (err: HttpErrorResponse) => {
            if (err.status === 403) {
              this.showVerifiedMailNotice = true
              this.email = email
            }
            if (err.error?.message) this.toastrService.error(err.error.message)
          }
        });
      case 'register':
       return this.authService.signUp({email, password, passwordConfirmation}).subscribe({
        next: (res) => {
          this.showVerifiedMailNotice = true;
          this.email = res.email
        },
        error: (err: HttpErrorResponse) => {
          if (err.error?.message) this.toastrService.error(err.error.message)
        }
       });
      case 'forgotPassword':
        return this.authService.sendResetPasswordMail(email).subscribe({
          next: (res) => {
            this.formType = 'login'
            this.toastrService.success(res.message)
          },
          error: (err: HttpErrorResponse) => {
            if (err.error?.message) this.toastrService.error(err.error.message)
          }
        })
    }
  }

}

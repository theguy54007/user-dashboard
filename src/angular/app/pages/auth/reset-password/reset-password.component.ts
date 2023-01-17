import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/angular/app/services/auth.service';
import { AuthFormType } from 'src/angular/app/shared/auth-form/auth-form.component';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  formType: AuthFormType = 'resetForgotPassword'
  currentPath = this.route.snapshot.url[0].path
  resetToken: string

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private toastrService: ToastrService
  ) { }

  ngOnInit(): void {

    switch (this.currentPath) {
      case 'reset-password':
        this.formType = 'resetPassword'
        break;
      case 'reset-forgot-password':
        this.formType = 'resetForgotPassword'
        const token = this.route.snapshot.params['token']
        if (token) {
          this.resetToken = token
        }
        break;
    }
  }

  onSubmit(form: FormGroup){
    const { oldPassword, password, passwordConfirmation } = form.value
    form.reset();

    switch(this.formType){
      case 'resetForgotPassword':
        return this.authService.resetForgotPassword({ password, passwordConfirmation }, this.resetToken).subscribe({
          next: (res) => {
            const {message} = res
            this.authService.redirectToLogin({message})
          },
          error: (err: HttpErrorResponse) => {
            const { message } = err.error || {}
            if (err.status === 401) return this.authService.redirectToLogin({errorMessage: message})
            if (message) this.toastrService.error(message)
          }
        })
      case 'resetPassword':
        return this.authService.resetPassword({oldPassword, password, passwordConfirmation}).subscribe({
          next: (res) => {
            this.authService.logout()
            const {message} = res
            this.authService.redirectToLogin({message})
          },
          error: (err: HttpErrorResponse) => {
            if (err.status === 403) {
              this.authService.redirectToLogin({errorMessage: 'please login before reset password'});
            }
            if (err.error?.message) this.toastrService.error(err.error.message)
          }
        })
    }
  }

}

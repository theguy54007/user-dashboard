import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/angular/app/services/auth.service';
import { ToastrNoticeService } from 'src/angular/app/services/toastr-notice.service';
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
    private toastrNotice: ToastrNoticeService
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
    const { originalPassword, password, passwordConfirmation } = form.value
    form.reset();

    switch(this.formType){
      case 'resetForgotPassword':
        return this.authService.resetForgotPassword({
          password,
          passwordConfirmation,
          resetToken: this.resetToken
        }).subscribe({
          next: (res) => {
            const { message } = res
            this.toastrNotice.addMessage({ notice: message })
            this.authService.redirectToLogin()
          },
          error: (err: HttpErrorResponse) => {
            const { message } = err.error || {}
            if (message) this.alertErrorMessage(message)

            if (err.status === 401) {
              return this.authService.redirectToLogin()
            }

          }
        })
      case 'resetPassword':
        return this.authService.resetPassword({originalPassword, password, passwordConfirmation}).subscribe({
          next: (res) => {
            this.authService.logout()
            const { message } = res
            this.toastrNotice.addMessage({ notice: message })
            this.authService.redirectToLogin()
          },
          error: (err: HttpErrorResponse) => {
            if (err.status === 403) {
              this.toastrNotice.addMessage({ error: 'please login before reset password' })
              return this.authService.redirectToLogin();
            }
            if (err.error?.message) this.alertErrorMessage(err.error.message)
          }
        })
    }
  }

  private alertErrorMessage(error: string){
    this.toastrNotice.addMessage({ error })
  }

}

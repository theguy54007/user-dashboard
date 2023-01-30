import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthMailService } from '../../services/auth-mail.service';
import { AuthService } from '../../services/auth.service';
import { ToastrNoticeService } from '../../services/toastr-notice.service';
import { AuthFormType } from '../../shared/auth-form/auth-form.component';


@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  formType: AuthFormType = 'login'
  showVerifiedMailNotice = false;
  hiddenSubmit = false;
  resendMailCount = 0;
  email: string
  currentPath = this.route.snapshot.url[0].path

  titleMapping = {
    login: 'Sign In',
    register: 'Create Account',
    forgotPassword: 'Forgot Password'
  }

  constructor(
    private readonly authService: AuthService,
    private readonly authMailService: AuthMailService,
    private readonly toastrNotice: ToastrNoticeService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    if (this.currentPath === 'sign-up') {
      this.formType = 'register'
    }
  }

  onSwitchMode(type: AuthFormType){
    this.formType = type
  }

  onOauthSignIn(done: boolean){
    if (done) this.handleAfterSignIn()
  }

  resendMail(){
    if (this.resendMailCount > 3 || !this.email) return

    this.authMailService.sendVerificationMail(this.email).subscribe({
      next: (res) => {
        this.toastrNotice.addMessage({ notice: res.message })
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
        return this.loginSubmit(email, password)
      case 'register':
       return this.registerSubmit(email, password, passwordConfirmation)
      case 'forgotPassword':
        return this.forgotPasswordSubmit(email);
    }
  }

  private alertErrorMessage(error: string){
    this.toastrNotice.addMessage({ error })
  }

  private handleAfterSignIn(){
    this.toastrNotice.addMessage({ success: 'login successfully!' })
    this.router.navigate([''])
  }

  private loginSubmit(email: string, password: string){
    return this.authService.signIn({ email, password }).subscribe({
      next: (_) => {
        this.handleAfterSignIn()
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 403) {
          this.showVerifiedMailNotice = true
          this.email = email
        }

        if (err.error?.message) this.alertErrorMessage(err.error.message)
      }
    });
  }

  private registerSubmit(email: string, password: string, passwordConfirmation: string){
    return this.authService.signUp({email, password, passwordConfirmation}).subscribe({
      next: (res) => {
        this.showVerifiedMailNotice = true;
        this.email = res.email
      },
      error: (err: HttpErrorResponse) => {
        if (err.error?.message) this.alertErrorMessage(err.error.message)
      }
    });
  }

  private forgotPasswordSubmit(email: string){
    return this.authMailService.sendResetPasswordMail(email).subscribe({
      next: (res) => {
        this.formType = 'login'
        this.toastrNotice.addMessage({success: res.message})
      },
      error: (err: HttpErrorResponse) => {
        if (err.error?.message) this.alertErrorMessage(err.error.message)
      }
    })
  }

}

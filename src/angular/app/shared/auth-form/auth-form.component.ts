import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';


const AuthFormTypes = ['login', 'register', 'forgotPassword', 'resetPassword', 'resetForgotPassword'] as const;
export type AuthFormType = typeof AuthFormTypes[number]


@Component({
  selector: 'app-auth-form',
  templateUrl: './auth-form.component.html',
  styleUrls: ['./auth-form.component.scss']
})
export class AuthFormComponent implements OnInit, OnChanges {
  @Input() formType: AuthFormType
  @Input() hiddenSubmit: boolean = false
  @Output() emitForm = new EventEmitter<FormGroup>();
  form: FormGroup;


  private formControlMapping = {
    email: new FormControl('', Validators.required),
    login: {password: new FormControl('', [
        Validators.required
      ])
    },
    register: {
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/)
      ]),
      passwordConfirmation: new FormControl('', [Validators.required])
    }
  }

  formContent = {
    login: {
      submit: 'Sign In',
      passwordInvalid: ''
    },
    forgotPassword: {
      submit: 'Send'
    },
    register: {
      submit: 'Sign Up',
      passwordInvalid: 'A password at least 8 letters, and contains one numeric digit, one special char (eg: !@#$%^&*), one lowercase char and one uppercase char',
    },
    resetPassword: {
      submit: 'Send',
      passwordInvalid: 'A password at least 8 letters, and contains one numeric digit, one special char (eg: !@#$%^&*), one lowercase char and one uppercase char',
    },
    resetForgotPassword: {
      submit: 'Send',
      passwordInvalid: 'A password at least 8 letters, and contains one numeric digit, one special char (eg: !@#$%^&*), one lowercase char and one uppercase char',
    },
  }

  constructor() { }

  ngOnInit(): void {
    this.initForm()
  }

  ngOnChanges(){
    this.initForm()
  }

  onSubmit(){
    if (!this.form.valid) {
      return
    }

    this.emitForm.emit(this.form)
    this.form.reset();
  }

  confirmedValidator(controlName: string, matchingControlName: string){
    return (formGroup: FormGroup) => {
        const control = formGroup.controls[controlName];
        const matchingControl = formGroup.controls[matchingControlName];
        if (!matchingControl || !control) return

        if (matchingControl.errors && !matchingControl.errors.confirmedValidator) {
            return;
        }
        if (control.value !== matchingControl.value) {
            matchingControl.setErrors({ confirmedValidator: true });
        } else {
            matchingControl.setErrors(null);
        }
    };
  }

  errorMessage(formControlName) {
    return this.form.controls[formControlName]?.errors && this.form.controls[formControlName].touched
  }


  private initForm(){
    this.form = new FormGroup({})

    switch (this.formType) {
      case 'resetPassword':
      case 'register':
        switch (this.formType) {
          case 'register':
            this.form.addControl('email', this.formControlMapping.email)
            break;
          case 'resetPassword':
            this.form.addControl('originalPassword', this.formControlMapping.login.password)
            break
        }
      case 'resetForgotPassword':
        this.form.addControl('passwordConfirmation', this.formControlMapping.register.passwordConfirmation)
        this.form.addValidators(this.confirmedValidator('password', 'passwordConfirmation') as ValidatorFn)
        this.form.addControl('password', this.formControlMapping.register.password)
        break;
      case 'login':
        this.form.addControl('password',this.formControlMapping.login.password)
      case 'forgotPassword':
        this.form.addControl('email', this.formControlMapping.email)
        break;
    }
  }
}

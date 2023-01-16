import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from 'src/angular/app/model/user/user.model';
import { AuthService } from 'src/angular/app/services/auth.service';
import { UserService } from 'src/angular/app/services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: User;
  form: FormGroup;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe({
      next: user => {
        this.user = user
        this.form = new FormGroup({
          name: new FormControl(this.user.name, Validators.required)
        })
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 403) {
          return this.authService.redirectToLogin({errorMessage: 'please login before you proceed'})
        }
        const { message } = err.error?.message || {}
        return this.authService.redirectToLogin({errorMessage: message})
      }
    })



  }

  onSubmit(){
    const { name } = this.form.value

    this.userService.updateName(name).subscribe({
      next: user => {
        this.authService.addNewUser(user)
        setTimeout(() => {
          this.router.navigate([''], {state: {success: 'Updated successfully!'}})
        }, 2000);
      }
    })
  }
}

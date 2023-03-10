import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from 'src/angular/app/model/user/user.model';
import { AuthService } from 'src/angular/app/services/auth.service';
import { ToastrNoticeService } from 'src/angular/app/services/toastr-notice.service';
import { UserService } from 'src/angular/app/services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: User;
  form: FormGroup;
  userSub: Subscription;
  isLoading = false;
  isButtonLoading = false;

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly router: Router,
    private readonly toastrNotice: ToastrNoticeService
  ) { }

  ngOnInit(): void {
    this.isLoading = true
    this.userSub = this.authService.user.subscribe({
      next: user => {
        this.user = user

        if (this.user) {
          this.form = new FormGroup({
            name: new FormControl(this.user.name, Validators.required)
          })
        }

        this.isLoading = false
      }
    })
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
  }

  onSubmit(){
    const { name } = this.form.value
    this.isButtonLoading = true
    this.userService.updateName(name).subscribe({
      next: user => {
        this.isButtonLoading = false
        this.authService.addNewUser(user)
        this.toastrNotice.addMessage({ success: 'Updated successfully!' })
        this.router.navigate([''])
      }
    })
  }
}

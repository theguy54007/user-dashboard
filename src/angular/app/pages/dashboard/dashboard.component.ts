import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  users: []
  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private toastrService: ToastrService
  ) {
    const { errorMessage, message, success } = this.router.getCurrentNavigation()?.extras?.state || {}
    if (message) this.toastrService.info(message)
    if (errorMessage) this.toastrService.error(errorMessage)
    if (success) this.toastrService.success(success)
  }

  ngOnInit(): void {
    this.userService.dashboardUsers().subscribe({
      next: res => {
        this.users = res
      },
      error: (err: HttpErrorResponse) =>{
        if (err.status === 403) return this.unauthorzedHandler()

        const {message} = err.error?.message || {}
        if ( message ) this.toastrService.error(message)
      }
    })
  }

  unauthorzedHandler(){
    this.authService.redirectToLogin({errorMessage: 'please login !'})
  }
}

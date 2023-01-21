import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from '../../model/user/user.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  userSub: Subscription
  user: User

  constructor(
    private readonly authService: AuthService
  ) { }

  ngOnInit(): void {
    this.userSub = this.authService.user.subscribe(user => {
      this.user = user
    });
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
  }

  onLogout(){
    this.authService.signOut().subscribe({
      next: _ => {
        this.authService.redirectToLogin()
      }
    })
  }

}

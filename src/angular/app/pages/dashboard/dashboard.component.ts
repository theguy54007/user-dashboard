import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { User } from '../../model/user/user.model';
import { ToastrNoticeService } from '../../services/toastr-notice.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  users: User[]
  statistic: UsersStatistic

  constructor(
    private userService: UserService,
    private toastrNotice: ToastrNoticeService
  ) {}

  ngOnInit(): void {
    this.userService.listWithLastSessionAt().subscribe({
      next: res => {
        this.users = res
      },
      error: (err: HttpErrorResponse) =>{
        const { message } = err.error?.message || {}
        if ( message ) this.toastrNotice.addMessage( { error: message } )
      }
    })

    this.userService.getStatistics().subscribe({
      next: (res: UsersStatistic) => {
        this.statistic = res
      }
    })
  }

}

interface UsersStatistic {
  total: number;
  activeToday: number;
  average7day: number
}

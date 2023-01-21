import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { User } from '../../model/user/user.model';
import { ToastrNoticeService } from '../../services/toastr-notice.service';
import { UserService } from '../../services/user.service';


interface UsersStatistic {
  total: number;
  activeToday: number;
  average7day: number
}


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  users: User[]
  statistic: UsersStatistic
  total = 0

  constructor(
    private userService: UserService,
    private toastrNotice: ToastrNoticeService
  ) {}

  ngOnInit(): void {
    this.userService.listWithLastSessionAt().subscribe({
      next: res => {
        const { total, users } = res
        this.users = users
        this.total = total
      },
      error: (err: HttpErrorResponse) =>{
        const { message: error } = err.error?.message || {}
        if ( error ) this.toastrNotice.addMessage( { error } )
      }
    })

    this.userService.getStatistics().subscribe({
      next: (res: UsersStatistic) => {
        this.statistic = res
      }
    })
  }

}

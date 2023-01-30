import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
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
export class DashboardComponent implements OnInit, OnDestroy {

  users: User[]
  statistic: UsersStatistic
  total = 0
  pageSub: Subscription
  pageSubject = new BehaviorSubject<number>(1)
  currentPage = 1

  constructor(
    private readonly userService: UserService,
    private readonly toastrNotice: ToastrNoticeService
  ) {}

  ngOnInit(): void {

    this.fetchList()
    this.userService.getStatistics().subscribe({
      next: (res: UsersStatistic) => {
        this.statistic = res
      }
    })


    this.pageSub = this.pageSubject.subscribe({
      next: p => {
        this.currentPage = p
        this.fetchList()
      }
    })
  }

  ngOnDestroy(): void {
    this.pageSub.unsubscribe()
  }

  private fetchList(){
    this.userService.listWithLastSessionAt(this.currentPage).subscribe({
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
  }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastrNoticeService } from './services/toastr-notice.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'user-dashboard';
  noticeSub: Subscription

  constructor(
    private toastrNotice: ToastrNoticeService
  ){}

  ngOnInit(){
    this.noticeSub = this.toastrNotice.messages.subscribe({
      next: (msg) => {
        if (msg) this.toastrNotice.showMessage(msg)
      }
    })
  }

  ngOnDestroy(): void {
    this.noticeSub.unsubscribe()
  }

}

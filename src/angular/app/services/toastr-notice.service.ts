import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject } from 'rxjs';

interface Message{
  error: string,
  success: string,
  notice: string
}

@Injectable({
  providedIn: 'root'
})
export class ToastrNoticeService {

  messages = new BehaviorSubject<Partial<Message>>(null)

  constructor(
    private toastrService: ToastrService
  ) { }

  addMessage(msg: Partial<Message>){
    this.messages.next(msg)
  }

  showMessage(msg: Partial<Message>){
    const { success, error, notice} = msg || {}

    if (success) this.toastrService.success(success)
    if (error) this.toastrService.error(error)
    if (notice) this.toastrService.show(notice)

    this.messages.next(null)
  }

}

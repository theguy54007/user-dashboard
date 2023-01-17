import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor(
    private apiService: ApiService
  ) { }

  createSession(actionName: string){
    if (actionName.length < 1) actionName = 'root'
    return this.apiService.post('session', { actionName })
  }
}

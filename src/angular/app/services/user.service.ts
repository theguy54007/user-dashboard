import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private apiService: ApiService,
  ) { }

  updateName(name: string){
    return this.apiService.patch('users/user', { name })
  }

  getCurrentUser(){
    return this.apiService.get('users/current-user')
  }
}

import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

export function fetchCurrentUserFactory(authServcie: AuthService) {
  return () => authServcie.autoSignIn();
}
@Injectable({
  providedIn: 'root',
  useFactory: fetchCurrentUserFactory,
  deps: [AuthService]
})
export class CurrentUserService {

  constructor() { }
}

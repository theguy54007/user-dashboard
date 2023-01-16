import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './pages/auth/auth.component';
import { ResetPasswordComponent } from './pages/auth/reset-password/reset-password.component';
import { VerifyEmailComponent } from './pages/auth/verify-email/verify-email.component';
import { ProfileComponent } from './pages/users/profile/profile.component';


const routes: Routes = [

  {
    path: 'profile',
    component: ProfileComponent
  },
  {
    path: 'auth',
    children: [
      {
        path: 'sign-in',
        component: AuthComponent
      },
      {
        path: 'sign-out',
        component: AuthComponent
      },
      {
        path: 'verify-email/:token',
        component: VerifyEmailComponent
      },
      {
        path: 'reset-forgot-password/:token',
        component: ResetPasswordComponent
      },
      {
        path: 'reset-password',
        component: ResetPasswordComponent
      },
    ]

  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

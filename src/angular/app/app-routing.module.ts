import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginGuard } from './guards/login.guard';
import { AuthComponent } from './pages/auth/auth.component';
import { ResetPasswordComponent } from './pages/auth/reset-password/reset-password.component';
import { VerifyEmailComponent } from './pages/auth/verify-email/verify-email.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProfileComponent } from './pages/users/profile/profile.component';


const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'auth',
    children: [
      {
        path: 'sign-in',
        component: AuthComponent,
        canActivate: [LoginGuard]
      },
      {
        path: 'sign-up',
        component: AuthComponent,
        canActivate: [LoginGuard]
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
        component: ResetPasswordComponent,
        canActivate: [AuthGuard]
      },
    ]
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

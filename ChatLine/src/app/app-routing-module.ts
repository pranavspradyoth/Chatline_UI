import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/register/register').then(m => m.RegisterComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./components/forgot-password/forgot-password').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./components/reset-password/reset-password').then(m => m.ResetPasswordComponent)
  },
  {
    path: '',
    loadComponent: () =>
      import('./components/layout/layout').then(m => m.Layout),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./components/dashboard/dashboard').then(m => m.DashboardComponent)
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./components/orders/orders').then(m => m.Orders)
      },
      {
        path: 'menu',
        loadComponent: () =>
          import('./components/menu/menu').then(m => m.Menu)
      },
      {
        path: 'account',
        loadComponent: () =>
          import('./components/account/account').then(m => m.Account)
      },
      {
        path: 'cart',
        loadComponent: () =>
          import('./components/cart/cart').then(m => m.Cart)
      }
    ]
  },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
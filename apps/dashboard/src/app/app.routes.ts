import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { SignInComponent } from './pages/auth-pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/auth-pages/sign-up/sign-up.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Default redirect → landing
  { path: '', redirectTo: '/landing', pathMatch: 'full' },

  // Public routes
  { path: 'landing', component: LandingComponent, title: 'Bienvenido | Finantial Dashboard' },
  { path: 'signin', component: SignInComponent, title: 'Sign In | TailAdmin' },
  { path: 'signup', component: SignUpComponent, title: 'Sign Up | TailAdmin' },

  // Protected routes: all /dashboard/** require authentication
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./pages/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
  },
];

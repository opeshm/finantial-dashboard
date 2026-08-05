import { Component, OnInit, inject, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

// Declare the global `google` object injected by the GIS SDK script
declare const google: {
  accounts: {
    id: {
      initialize(config: {
        client_id: string;
        callback: (response: { credential: string }) => void;
        auto_select?: boolean;
        cancel_on_tap_outside?: boolean;
      }): void;
      renderButton(parent: HTMLElement, options: object): void;
      prompt(): void;
    };
  };
};

const GOOGLE_CLIENT_ID =
  '413148745371-duqu2q5n483gqc6o70tcsuf4uakadprk.apps.googleusercontent.com';

@Component({
  selector: 'app-landing',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-10 flex flex-col items-center gap-6 max-w-md w-full">
        <h1 class="text-3xl font-bold text-gray-800 dark:text-white text-center">
          Finantial Dashboard
        </h1>
        <p class="text-gray-500 dark:text-gray-400 text-center text-sm">
          Gestiona tus finanzas de forma inteligente.<br>
          Inicia sesión para acceder a tu panel.
        </p>
        <!-- GIS renders the Google Sign-In button inside this div -->
        <div id="google-signin-btn"></div>
      </div>
    </div>
  `,
})
export class LandingComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);

  ngOnInit(): void {
    // If already authenticated, go straight to dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // Wait for the GIS SDK script to load before calling initialize
    this.waitForGoogleSdk().then(() => this.initGoogleSignIn());
  }

  private initGoogleSignIn(): void {
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => {
        // GIS callback runs outside Angular's zone — re-enter it
        this.ngZone.run(() => {
          this.authService.handleGoogleCredential(response.credential).catch(err => {
            console.error('Authentication error:', err);
          });
        });
      },
      cancel_on_tap_outside: false,
    });

    const btnEl = document.getElementById('google-signin-btn');
    if (btnEl) {
      google.accounts.id.renderButton(btnEl, {
        type: 'standard',
        shape: 'rectangular',
        theme: 'outline',
        text: 'signin_with',
        size: 'large',
        locale: 'es',
      });
    }
  }

  /** Polls until window.google is available (SDK loads asynchronously). */
  private waitForGoogleSdk(): Promise<void> {
    return new Promise((resolve) => {
      if (typeof google !== 'undefined') {
        resolve();
        return;
      }
      const interval = setInterval(() => {
        if (typeof google !== 'undefined') {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
  }
}

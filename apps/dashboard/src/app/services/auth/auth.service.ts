import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { User, UserSocialLinks } from './user.model';

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';
const API_URL = 'http://localhost:4312';

/**
 * Angular service responsible for:
 * - Authenticating users via Google OAuth2.
 * - Managing user session state in localStorage and Angular Signals.
 * - Synchronizing profile updates (names, social links) with the API.
 * - Uploading custom avatar images to the local API CDN.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _currentUser = signal<User | null>(this.loadUserFromStorage());

  /** Reactive: current authenticated user (null if not logged in). */
  readonly currentUser = this._currentUser.asReadonly();

  /** Reactive: true when a user session is active. */
  readonly isAuthenticated = computed(() => this._currentUser() !== null);

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {}

  /**
   * Called by the Google Identity Services callback.
   * Sends the credential (ID token) to the backend, stores the session
   * and navigates to the dashboard.
   */
  async handleGoogleCredential(idToken: string): Promise<void> {
    const user = await firstValueFrom(
      this.http.post<User>(`${API_URL}/auth/google`, { idToken }),
    );
    this.persistSession(idToken, user);
    await this.router.navigate(['/dashboard']);
  }

  /**
   * Updates user profile names and social links in the API backend,
   * updating local reactive signal and localStorage.
   */
  async updateProfile(dto: {
    firstName?: string;
    lastName?: string;
    socialLinks?: UserSocialLinks;
  }): Promise<User> {
    const user = this._currentUser();
    if (!user) throw new Error('No active user session found');

    const updatedUser = await firstValueFrom(
      this.http.patch<User>(`${API_URL}/users/${user.id}/profile`, dto),
    );

    this.persistUser(updatedUser);
    return updatedUser;
  }

  /**
   * Uploads a custom avatar file to the local API CDN,
   * updating local reactive signal and localStorage.
   */
  async uploadAvatar(file: File): Promise<User> {
    const user = this._currentUser();
    if (!user) throw new Error('No active user session found');

    const formData = new FormData();
    formData.append('avatar', file);

    const updatedUser = await firstValueFrom(
      this.http.post<User>(`${API_URL}/users/${user.id}/avatar`, formData),
    );

    this.persistUser(updatedUser);
    return updatedUser;
  }

  /**
   * Clears the session and navigates back to the landing page.
   */
  async logout(): Promise<void> {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    this._currentUser.set(null);
    await this.router.navigate(['/landing']);
  }

  /** Returns the stored raw token (used by authGuard). */
  getToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private persistSession(token: string, user: User): void {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    this.persistUser(user);
  }

  private persistUser(user: User): void {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    this._currentUser.set(user);
  }

  private loadUserFromStorage(): User | null {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/auth-models';

const SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours
const TOKEN_KEY = 'caff_token';
const USER_KEY = 'caff_user';
const EXPIRY_KEY = 'caff_expiry';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private sessionTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private http: HttpClient, private router: Router) {
    this.restoreSession();
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload).pipe(
      tap(res => this.handleAuthSuccess(res)),
      catchError(this.handleError)
    );
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, payload).pipe(
      tap(res => this.handleAuthSuccess(res)),
      catchError((error: HttpErrorResponse) => {
        let message = 'An unexpected error occurred. Please try again.';

        if (error.status === 0) {
          message = 'Cannot connect to server. Please check your connection.';
        } else if (error.status === 409) {
          message = error.error?.message || 'An account with this email already exists.';
        } else if (error.status === 422) {
          message = error.error?.message || 'Invalid input. Please check your details.';
        } else if (error.error?.message) {
          message = error.error.message;
        }

        return throwError(() => new Error(message));
      })
    );
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${this.apiUrl}/forgot-password`, { email })
      .pipe(catchError(this.handleError));
  }

  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${this.apiUrl}/reset-password`, { token, new_password: newPassword })
      .pipe(catchError(this.handleError));
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    const expiry = sessionStorage.getItem(EXPIRY_KEY);
    if (!expiry) return false;
    if (Date.now() > parseInt(expiry, 10)) {
      this.clearSession();
      return false;
    }
    return !!this.getToken();
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // ─── Internal helpers ──────────────────────────────────────────────────────

  private handleAuthSuccess(res: AuthResponse): void {
    const expiry = Date.now() + SESSION_DURATION_MS;
    sessionStorage.setItem(TOKEN_KEY, res.access_token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(res.user));
    sessionStorage.setItem(EXPIRY_KEY, expiry.toString());
    this.currentUserSubject.next(res.user);
    this.startSessionTimer(SESSION_DURATION_MS);
  }

  private restoreSession(): void {
    const token = sessionStorage.getItem(TOKEN_KEY);
    const userStr = sessionStorage.getItem(USER_KEY);
    const expiry = sessionStorage.getItem(EXPIRY_KEY);

    if (!token || !userStr || !expiry) return;

    const remaining = parseInt(expiry, 10) - Date.now();
    if (remaining <= 0) {
      this.clearSession();
      return;
    }

    this.currentUserSubject.next(JSON.parse(userStr));
    this.startSessionTimer(remaining);
  }

  private startSessionTimer(duration: number): void {
    if (this.sessionTimer) clearTimeout(this.sessionTimer);
    this.sessionTimer = setTimeout(() => {
      this.clearSession();
      this.router.navigate(['/login'], {
        queryParams: { reason: 'session_expired' }
      });
    }, duration);
  }

  private clearSession(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(EXPIRY_KEY);
    this.currentUserSubject.next(null);
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
  }

  private handleError(error: HttpErrorResponse) {
    let message = 'An unexpected error occurred. Please try again.';
    if (error.error instanceof ErrorEvent) {
      message = error.error.message;
    } else if (error.error?.message) {
      message = error.error.message;
    } else if (error.status === 401) {
      message = 'Invalid email or password.';
    } else if (error.status === 409) {
      message = 'An account with this email already exists.';
    } else if (error.status === 404) {
      message = 'No account found with this email address.';
    } else if (error.status === 0) {
      message = 'Cannot connect to server. Please check your connection.';
    }
    return throwError(() => new Error(message));
  }
}
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

function passwordMatchValidator(c: AbstractControl): ValidationErrors | null {
  const pw = c.get('password');
  const cf = c.get('confirmPassword');
  if (!pw || !cf) return null;
  return pw.value !== cf.value ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
<div class="auth-page">
  <div class="card">
    <div class="card-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"/>
      </svg>
    </div>

    <div class="card-header">
      <h2>Reset password</h2>
      <p>Choose a strong new password for your account.</p>
    </div>

    <!-- Invalid/expired token -->
    <div class="token-error" *ngIf="tokenInvalid">
      <p>This reset link is invalid or has expired.</p>
      <a routerLink="/forgot-password" class="btn-primary">Request a new link</a>
    </div>

    <!-- Success state -->
    <div class="success-state" *ngIf="resetSuccess">
      <div class="success-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
      <h3>Password updated!</h3>
      <p>Your password has been reset successfully.</p>
      <a routerLink="/login" class="btn-primary">Sign in now</a>
    </div>

    <!-- Form -->
    <ng-container *ngIf="!tokenInvalid && !resetSuccess">
      <div class="alert alert-error" *ngIf="errorMessage" role="alert">
        <svg viewBox="0 0 20 20" fill="currentColor" class="alert-icon">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
        </svg>
        <span>{{ errorMessage }}</span>
      </div>

      <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" novalidate>
        <div class="form-group">
          <label class="form-label">New password</label>
          <div class="input-wrapper" [class.error]="pw.invalid && pw.touched">
            <svg class="input-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
            </svg>
            <input [type]="showPw ? 'text' : 'password'" formControlName="password"
              class="form-input" placeholder="Min. 8 characters" autocomplete="new-password" />
            <button type="button" class="toggle-password" (click)="showPw = !showPw">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
              </svg>
            </button>
          </div>
          <div class="field-error" *ngIf="pw.invalid && pw.touched">
            <span *ngIf="pw.errors?.['required']">Password is required.</span>
            <span *ngIf="pw.errors?.['minlength']">At least 8 characters required.</span>
            <span *ngIf="pw.errors?.['pattern']">Must include uppercase, lowercase, and a number.</span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Confirm new password</label>
          <div class="input-wrapper"
            [class.error]="cf.touched && (cf.errors?.['required'] || resetForm.errors?.['passwordMismatch'])">
            <svg class="input-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
            </svg>
            <input [type]="showCf ? 'text' : 'password'" formControlName="confirmPassword"
              class="form-input" placeholder="Repeat new password" autocomplete="new-password" />
            <button type="button" class="toggle-password" (click)="showCf = !showCf">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
              </svg>
            </button>
          </div>
          <div class="field-error" *ngIf="cf.touched">
            <span *ngIf="cf.errors?.['required']">Please confirm your password.</span>
            <span *ngIf="!cf.errors?.['required'] && resetForm.errors?.['passwordMismatch']">Passwords do not match.</span>
          </div>
        </div>

        <button type="submit" class="btn-primary" [disabled]="isLoading">
          <svg *ngIf="isLoading" class="spinner" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity=".25"/>
            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <span>{{ isLoading ? 'Updating...' : 'Update password' }}</span>
        </button>
      </form>
    </ng-container>

    <div class="card-footer" *ngIf="!resetSuccess && !tokenInvalid">
      <a routerLink="/login" class="back-link">
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"/>
        </svg>
        Back to sign in
      </a>
    </div>
  </div>
</div>
  `,
  styleUrls: ['./reset-password.scss']
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  resetForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  resetSuccess = false;
  tokenInvalid = false;
  showPw = false;
  showCf = false;
  private token = '';
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'] || '';
    if (!this.token) { this.tokenInvalid = true; return; }

    this.resetForm = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordMatchValidator });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  get pw() { return this.resetForm.get('password')!; }
  get cf() { return this.resetForm.get('confirmPassword')!; }

  onSubmit(): void {
    if (this.resetForm.invalid) { this.resetForm.markAllAsTouched(); return; }
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.resetPassword(this.token, this.resetForm.value.password)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => { this.isLoading = false; this.resetSuccess = true; },
        error: (err: Error) => {
          this.isLoading = false;
          if (err.message.toLowerCase().includes('token')) {
            this.tokenInvalid = true;
          } else {
            this.errorMessage = err.message;
          }
        }
      });
  }
}
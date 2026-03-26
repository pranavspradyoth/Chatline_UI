import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
<div class="auth-page">
  <div class="card">

    <div class="card-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
      </svg>
    </div>

    <div class="card-header">
      <h2>Forgot password?</h2>
      <p>Enter your email and we'll send a reset link.</p>
    </div>

    <!-- Success state -->
    <div class="success-state" *ngIf="submitted && !errorMessage">
      <div class="success-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
        </svg>
      </div>
      <h3>Check your email</h3>
      <p>We sent a password reset link to <strong>{{ forgotForm.get('email')?.value }}</strong>. Check your inbox and spam folder.</p>
      <p class="resend-note">Didn't receive it? <button type="button" (click)="submitted = false">Try again</button></p>
    </div>

    <!-- Form state -->
    <ng-container *ngIf="!submitted || errorMessage">
      <div class="alert alert-error" *ngIf="errorMessage" role="alert">
        <svg viewBox="0 0 20 20" fill="currentColor" class="alert-icon">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
        </svg>
        <span>{{ errorMessage }}</span>
      </div>

      <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()" novalidate>
        <div class="form-group">
          <label for="fp-email" class="form-label">Email address</label>
          <div class="input-wrapper" [class.error]="email.invalid && email.touched">
            <svg class="input-icon" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
            </svg>
            <input id="fp-email" type="email" formControlName="email" class="form-input"
              placeholder="Enter your email" autocomplete="email" />
          </div>
          <div class="field-error" *ngIf="email.invalid && email.touched">
            <span *ngIf="email.errors?.['required']">Email is required.</span>
            <span *ngIf="email.errors?.['email']">Enter a valid email address.</span>
          </div>
        </div>

        <button type="submit" class="btn-primary" [disabled]="isLoading">
          <svg *ngIf="isLoading" class="spinner" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity=".25"/>
            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <span>{{ isLoading ? 'Sending...' : 'Send reset link' }}</span>
        </button>
      </form>
    </ng-container>

    <div class="card-footer">
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
  styleUrls: ['./forgot-password.scss']
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  forgotForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  submitted = false;
  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder, private authService: AuthService) {}

  ngOnInit(): void {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get email() { return this.forgotForm.get('email')!; }

  onSubmit(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';

    this.authService
      .forgotPassword(this.forgotForm.value.email)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.submitted = true;
        },
        error: (err: Error) => {
          this.isLoading = false;
          this.errorMessage = err.message;
        }
      });
  }
}
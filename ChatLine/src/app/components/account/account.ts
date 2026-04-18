// src/app/components/account/account.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../services/auth-service';
import { User } from '../../models/auth-models';
import { environment } from '../../../environments/environment';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const pw = control.get('newPassword');
  const cf = control.get('confirmPassword');
  if (!pw || !cf) return null;
  return pw.value !== cf.value ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './account.html',
  styleUrls: ['./account.scss']
})
export class AccountComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  passwordForm!: FormGroup;

  isChangingPassword = false;
  showCurrent  = false;
  showNew      = false;
  showConfirm  = false;
  passwordSuccess = '';
  passwordError   = '';
  showSignoutConfirm = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordMatchValidator });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get currentPassword() { return this.passwordForm.get('currentPassword')!; }
  get newPassword()     { return this.passwordForm.get('newPassword')!; }
  get confirmPassword() { return this.passwordForm.get('confirmPassword')!; }

  getPasswordStrength(): { label: string; level: number } {
    const val = this.newPassword.value || '';
    let level = 0;
    if (val.length >= 8) level++;
    if (/[A-Z]/.test(val)) level++;
    if (/[0-9]/.test(val)) level++;
    if (/[^A-Za-z0-9]/.test(val)) level++;
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    return { label: labels[level] || '', level };
  }

  getUserInitials(): string {
    if (!this.currentUser) return '?';
    if (this.currentUser.full_name) {
      return this.currentUser.full_name
        .split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
    }
    return this.currentUser.email[0].toUpperCase();
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.isChangingPassword = true;
    this.passwordError   = '';
    this.passwordSuccess = '';

    const payload = {
      current_password: this.passwordForm.value.currentPassword,
      new_password:     this.passwordForm.value.newPassword
    };

    this.http.post(`${environment.apiUrl}/auth/change-password`, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isChangingPassword = false;
          this.passwordSuccess = 'Password changed successfully!';
          this.passwordForm.reset();
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          this.isChangingPassword = false;
          if (err.status === 410) {
            this.passwordError = 'Current password is incorrect.';
          } else {
            this.passwordError = err.error?.message || 'Failed to change password. Please try again.';
          }
          this.cdr.detectChanges();
        }
      });
  }

  confirmSignout(): void { this.showSignoutConfirm = true; }
  cancelSignout():  void { this.showSignoutConfirm = false; }
  signOut():        void { this.authService.logout(); }
}
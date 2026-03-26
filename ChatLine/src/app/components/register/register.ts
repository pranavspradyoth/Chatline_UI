import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirm = control.get('confirmPassword');
  if (!password || !confirm) return null;
  return password.value !== confirm.value ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';  
  showPassword = false;
  showConfirm = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
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

  get email() { return this.registerForm.get('email')!; }
  get password() { return this.registerForm.get('password')!; }
  get confirmPassword() { return this.registerForm.get('confirmPassword')!; }

  getPasswordStrength(): { label: string; level: number } {
    const val = this.password.value || '';
    let level = 0;
    if (val.length >= 8) level++;
    if (/[A-Z]/.test(val)) level++;
    if (/[0-9]/.test(val)) level++;
    if (/[^A-Za-z0-9]/.test(val)) level++;
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    return { label: labels[level] || '', level };
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { email, password } = this.registerForm.value;

    this.authService
      .register({ email, password })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Account created successfully! Please sign in.';
          this.registerForm.reset();
        },
        error: (err: Error) => {
          console.log('Registration error:', err.message);
          this.isLoading = false;
          this.errorMessage = err.message || 'Something went wrong. Please try again.';
          this.cdr.detectChanges();
        }
      });
  }
}
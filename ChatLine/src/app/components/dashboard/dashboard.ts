import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { User } from '../../models/auth-models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
<div class="dashboard-welcome">
      <div class="welcome-card">
        <div class="welcome-icon">👋</div>
        <h1>Welcome back<span *ngIf="currentUser?.full_name">, {{ currentUser?.full_name }}</span>!</h1>
        <p>{{ currentUser?.email }}</p>
        <p class="coming-soon">Dashboard content coming in the next sprint.</p>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-welcome {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      font-family: 'DM Sans', 'Segoe UI', sans-serif;
    }
    .welcome-card {
      text-align: center;
      background: #fff;
      border-radius: 20px;
      padding: 3rem 2.5rem;
      box-shadow: 0 4px 24px rgba(43,127,224,.08);
      max-width: 480px;
      width: 100%;
    }
    .welcome-icon { font-size: 3rem; margin-bottom: 1rem; }
    h1 {
      font-size: 1.75rem;
      font-weight: 700;
      color: #0F172A;
      letter-spacing: -.03em;
      margin: 0 0 .4rem;
    }
    p { color: #475569; margin: 0 0 .5rem; font-size: .95rem; }
    .coming-soon {
      margin-top: 1rem;
      font-size: .875rem;
      color: #94A3B8;
      background: #F0F7FF;
      padding: .6rem 1rem;
      border-radius: 8px;
      display: inline-block;
    }
  `]
})
export class DashboardComponent {
  currentUser: User | null = null;
 
  constructor(private authService: AuthService) {}
 
  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
  }
}
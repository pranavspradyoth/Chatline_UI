import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header.component/header.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent],
  template: `
    <app-header></app-header>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; background: #F0F7FF; }
    .main-content {
      max-width: 1280px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }
    @media (max-width: 768px) {
      .main-content { padding: 1.25rem 1rem; }
    }
  `]
})
export class Layout {}
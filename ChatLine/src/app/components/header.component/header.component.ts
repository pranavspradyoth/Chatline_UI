import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth-service';
import { User } from '../../models/auth-models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isProfileMenuOpen = false;
  isMobileMenuOpen = false;
  currentRoute = '';
  private destroy$ = new Subject<void>();

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Track current user
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => this.currentUser = user);

    // Track active route for nav highlighting
    this.router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((e: any) => {
        this.currentRoute = e.urlAfterRedirects;
        this.isMobileMenuOpen = false; // close menu on navigation
      });

    this.currentRoute = this.router.url;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-menu-wrapper')) {
      this.isProfileMenuOpen = false;
    }
    if (!target.closest('.mobile-menu-wrapper') && !target.closest('.hamburger')) {
      this.isMobileMenuOpen = false;
    }
  }

  toggleProfileMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  toggleMobileMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  logout(): void {
    this.isProfileMenuOpen = false;
    this.isMobileMenuOpen = false;
    this.authService.logout();
  }

  getUserInitials(): string {
    if (!this.currentUser) return '?';
    if (this.currentUser.full_name) {
      return this.currentUser.full_name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    }
    return this.currentUser.email[0].toUpperCase();
  }

  isActive(route: string): boolean {
    return this.currentRoute.startsWith(route);
  }
}
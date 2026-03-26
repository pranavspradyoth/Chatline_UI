// src/app/components/menu/menu.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MenuService, MenuItem } from '../../services/menu.service';
import { CartService } from '../../services/cart.service';

export interface CategoryGroup {
  name: string;
  items: MenuItem[];
  isOpen: boolean;
}

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu.html',
  styleUrls: ['./menu.scss']
})
export class Menu implements OnInit, OnDestroy {
  categoryGroups: CategoryGroup[] = [];
  filteredGroups: CategoryGroup[] = [];
  isLoading = true;
  errorMessage = '';
  searchQuery = '';
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    public menuService: MenuService,
    public cartService: CartService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMenu();
    this.searchSubject.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => this.applySearch(query));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMenu(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.menuService.getAllItems()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items) => {
          this.buildCategoryGroups(items);
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err: Error) => {
          this.errorMessage = err.message;
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  private buildCategoryGroups(items: MenuItem[]): void {
    const map = new Map<string, MenuItem[]>();
    items.forEach(item => {
      const cat = item.category || 'Other';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(item);
    });
    this.categoryGroups = Array.from(map.entries()).map(([name, items]) => ({
      name, items, isOpen: true
    }));
    this.filteredGroups = [...this.categoryGroups];
  }

  onSearch(query: string): void {
    this.searchSubject.next(query);
  }

  private applySearch(query: string): void {
    const q = query.trim().toLowerCase();
    if (!q) {
      this.filteredGroups = this.categoryGroups.map(g => ({
        ...g,
        items: [...g.items],
        isOpen: this.categoryGroups.find(x => x.name === g.name)?.isOpen ?? true
      }));
      return;
    }
    this.filteredGroups = this.categoryGroups
      .map(g => ({
        ...g,
        items: g.items.filter(i => i.name.toLowerCase().includes(q)),
        isOpen: true
      }))
      .filter(g => g.items.length > 0);
  }

  toggleCategory(group: CategoryGroup): void {
    group.isOpen = !group.isOpen;
    const master = this.categoryGroups.find(g => g.name === group.name);
    if (master) master.isOpen = group.isOpen;
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.onSearch('');
  }

  addToCart(item: MenuItem): void { this.cartService.add(item); }
  removeFromCart(item: MenuItem): void { this.cartService.remove(item._id); }
  getQuantity(itemId: string): number { return this.cartService.getQuantity(itemId); }
  viewCart(): void { this.router.navigate(['/cart']); }

  get totalCartItems(): number { return this.cartService.totalItems; }
  get totalCartPrice(): number { return this.cartService.totalPrice; }
  get hasCart(): boolean { return this.cartService.totalItems > 0; }

  trackByCategory(_: number, group: CategoryGroup): string { return group.name; }
  trackByItem(_: number, item: MenuItem): string { return item._id; }
}
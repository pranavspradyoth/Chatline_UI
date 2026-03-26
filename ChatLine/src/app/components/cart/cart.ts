// src/app/components/cart/cart.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../services/menu.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth-service';

type PageState = 'cart' | 'placing' | 'success' | 'error';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss']
})
export class Cart implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  pageState: PageState = 'cart';
  errorMessage = '';
  placedOrderId = '';
  private destroy$ = new Subject<void>();

  constructor(
    public cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cartService.cart$
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => {
        this.cartItems = items;
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get totalItems(): number { return this.cartService.totalItems; }
  get totalPrice(): number { return this.cartService.totalPrice; }
  get isEmpty(): boolean   { return this.cartItems.length === 0; }

  increment(item: CartItem): void { this.cartService.add(item.item); }
  decrement(item: CartItem): void { this.cartService.remove(item.item._id); }

  backToMenu(): void { this.router.navigate(['/menu']); }

  placeOrder(): void {
    const user = this.authService.currentUser;
    if (!user) { this.router.navigate(['/login']); return; }

    this.pageState = 'placing';
    this.errorMessage = '';

    const payload = {
      user_id: user.id?.toString() || user.email,
      email:   user.email,
      items: this.cartItems.map(c => ({
        item_id:  c.item._id,
        name:     c.item.name,
        qty:      c.quantity.toString(),
        price:    c.item.price.toString()
      })),
      total: this.totalPrice
    };

    this.orderService.placeOrder(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.placedOrderId = res.orderId;
          this.cartService.clear();
          this.pageState = 'success';
          this.cdr.detectChanges();
        },
        error: (err: Error) => {
          this.errorMessage = err.message;
          this.pageState = 'error';
          this.cdr.detectChanges();
        }
      });
  }

  goToDashboard(): void { this.router.navigate(['/dashboard']); }
  tryAgain(): void      { this.pageState = 'cart'; this.errorMessage = ''; }

  trackByItem(_: number, item: CartItem): string { return item.item._id; }
}
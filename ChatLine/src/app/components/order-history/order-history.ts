// src/app/components/order-history/order-history.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { OrderCardComponent } from './order-card/order-card';

export interface OrderItem {
  item_id: string;
  name: string;
  qty: string;
  price: string;
}

export type OrderStatus = 'Received' | 'Served' | 'Cancelled';

export interface Order {
  _id: string;
  orderId: string;
  studentName: string;
  email: string;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: string;
  totalCost: number;
}

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterModule, OrderCardComponent],
  templateUrl: './order-history.html',
  styleUrls: ['./order-history.scss']
})
export class OrderHistoryComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  isLoading = true;
  errorMessage = '';
  activeFilter: OrderStatus | 'All' = 'All';
  private destroy$ = new Subject<void>();

  readonly filters: (OrderStatus | 'All')[] = ['All', 'Received', 'Served', 'Cancelled'];

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<Order[]>(`${environment.apiUrl}/order-history`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (orders) => {
          this.orders = orders;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = err.error?.message || 'Failed to load order history. Please try again.';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  setFilter(filter: OrderStatus | 'All'): void {
    this.activeFilter = filter;
  }

  get filteredOrders(): Order[] {
    if (this.activeFilter === 'All') return this.orders;
    return this.orders.filter(o => o.status === this.activeFilter);
  }

  getCount(filter: OrderStatus | 'All'): number {
    if (filter === 'All') return this.orders.length;
    return this.orders.filter(o => o.status === filter).length;
  }

  trackByOrder(_: number, order: Order): string {
    return order._id;
  }
}

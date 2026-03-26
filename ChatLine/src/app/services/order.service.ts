// src/app/services/order.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { CartService } from './cart.service';

export interface OrderItem {
  item_id: string;
  name: string;
  qty: string;
  price: string;
}

export interface PlaceOrderPayload {
  user_id: string;       // student identifier
  email: string;         // student email (new field)
  items: OrderItem[];
  total: number;
}

export interface OrderResponse {
  _id: string;
  orderId: string;
  studentName: string;
  email: string;
  items: OrderItem[];
  status: string;
  createdAt: string;
  totalCost: number;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  placeOrder(payload: PlaceOrderPayload): Observable<OrderResponse> {
    return this.http
      .post<OrderResponse>(`${this.apiUrl}/orders`, payload)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let message = 'Failed to place order. Please try again.';
    if (error.status === 0)   message = 'Cannot connect to server. Please check your connection.';
    if (error.status === 400) message = error.error?.message || 'Invalid order data.';
    if (error.status === 500) message = 'Server error. Please try again in a moment.';
    return throwError(() => new Error(message));
  }
}
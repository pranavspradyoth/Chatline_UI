// src/app/services/cart.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MenuItem, CartItem } from './menu.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  cart$ = this.cartSubject.asObservable();

  get items(): CartItem[] {
    return this.cartSubject.value;
  }

  getQuantity(itemId: string): number {
    return this.items.find(c => c.item._id === itemId)?.quantity ?? 0;
  }

  add(item: MenuItem): void {
    const current = [...this.items];
    const idx = current.findIndex(c => c.item._id === item._id);
    if (idx >= 0) {
      current[idx] = { ...current[idx], quantity: current[idx].quantity + 1 };
    } else {
      current.push({ item, quantity: 1 });
    }
    this.cartSubject.next(current);
  }

  remove(itemId: string): void {
    const current = [...this.items];
    const idx = current.findIndex(c => c.item._id === itemId);
    if (idx < 0) return;
    if (current[idx].quantity > 1) {
      current[idx] = { ...current[idx], quantity: current[idx].quantity - 1 };
    } else {
      current.splice(idx, 1);
    }
    this.cartSubject.next(current);
  }

  clear(): void {
    this.cartSubject.next([]);
  }

  get totalItems(): number {
    return this.items.reduce((sum, c) => sum + c.quantity, 0);
  }

  get totalPrice(): number {
    return this.items.reduce((sum, c) => sum + c.item.price * c.quantity, 0);
  }
}
// src/app/components/order-history/order-card/order-card.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order } from '../order-history';

@Component({
  selector: 'app-order-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-card.html',
  styleUrls: ['./order-card.scss']
})
export class OrderCardComponent {
  @Input() order!: Order;
  isExpanded = false;

  toggle(): void {
    this.isExpanded = !this.isExpanded;
  }

  toIST(utcString: string): string {
    if (!utcString) return '—';
    const date = new Date(utcString);
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day:    '2-digit',
      month:  'short',
      year:   'numeric',
      hour:   '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  getTotalItems(): number {
    return this.order.items.reduce((sum, i) => sum + (parseInt(i.qty, 10) || 1), 0);
  }

  get statusClass(): string {
    switch (this.order.status) {
      case 'Received':  return 'status-received';
      case 'Served':    return 'status-served';
      case 'Cancelled': return 'status-cancelled';
      default:          return 'status-received';
    }
  }

  get statusIcon(): string {
    switch (this.order.status) {
      case 'Received':  return '🕐';
      case 'Served':    return '🍽️';
      case 'Cancelled': return '❌';
      default:          return '🕐';
    }
  }

  get itemsPreview(): string {
    return this.order.items.map(i => i.name).join(', ');
  }

  trackByItem(_: number, item: any): string {
    return item.item_id;
  }
}
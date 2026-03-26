// src/app/services/menu.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface MenuItem {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  available: boolean;
}

export interface Category {
  _id: string;
  name: string;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class MenuService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllItems(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.apiUrl}/items`).pipe(
      catchError(this.handleError)
    );
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`).pipe(
      catchError(this.handleError)
    );
  }

  getItemsByCategory(category: string): Observable<MenuItem[]> {
    return this.http
      .get<MenuItem[]>(`${this.apiUrl}/itemsperCat?category=${encodeURIComponent(category)}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let message = 'Failed to load menu. Please try again.';
    if (error.status === 0) message = 'Cannot connect to server.';
    return throwError(() => new Error(message));
  }
}
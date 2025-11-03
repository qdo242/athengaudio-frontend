import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Product } from '../interfaces/product';

export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  subTotal?: number;
}

export interface Cart {
  id?: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:8080/api/carts';
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Kết nối với Spring Boot API
  getCartByUser(userId: string): Observable<Cart> {
    return this.http.get<Cart>(`${this.apiUrl}/user/${userId}`);
  }

  addToCart(userId: string, item: CartItem): Observable<Cart> {
    return this.http.post<Cart>(`${this.apiUrl}/user/${userId}/items`, item);
  }

  updateQuantity(userId: string, productId: string, quantity: number): Observable<Cart> {
    return this.http.put<Cart>(`${this.apiUrl}/user/${userId}/items/${productId}?quantity=${quantity}`, {});
  }

  removeFromCart(userId: string, productId: string): Observable<Cart> {
    return this.http.delete<Cart>(`${this.apiUrl}/user/${userId}/items/${productId}`);
  }

  clearCart(userId: string): Observable<Cart> {
    return this.http.delete<Cart>(`${this.apiUrl}/user/${userId}/clear`);
  }

  // Các method cho frontend
  getCartItems(): Observable<CartItem[]> {
    return this.cartItems$;
  }

  addToCartFrontend(product: Product, quantity: number = 1, userId: string = 'user123'): Observable<void> {
    const cartItem: CartItem = {
      productId: product.id?.toString() || '',
      productName: product.name,
      price: product.price,
      quantity: quantity,
      subTotal: product.price * quantity
    };

    return new Observable(observer => {
      this.addToCart(userId, cartItem).subscribe({
        next: (cart) => {
          this.cartItemsSubject.next(cart.items);
          observer.next();
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }

  removeFromCartFrontend(productId: number, userId: string = 'user123'): Observable<void> {
    return new Observable(observer => {
      this.removeFromCart(userId, productId.toString()).subscribe({
        next: (cart) => {
          this.cartItemsSubject.next(cart.items);
          observer.next();
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }

  updateQuantityFrontend(productId: number, quantity: number, userId: string = 'user123'): Observable<void> {
    return new Observable(observer => {
      this.updateQuantity(userId, productId.toString(), quantity).subscribe({
        next: (cart) => {
          this.cartItemsSubject.next(cart.items);
          observer.next();
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }

  clearCartFrontend(userId: string = 'user123'): Observable<void> {
    return new Observable(observer => {
      this.clearCart(userId).subscribe({
        next: () => {
          this.cartItemsSubject.next([]);
          observer.next();
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }

  getCartTotal(): Observable<number> {
    return new Observable(observer => {
      this.cartItems$.subscribe(items => {
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        observer.next(total);
      });
    });
  }

  getCartItemCount(): Observable<number> {
    return new Observable(observer => {
      this.cartItems$.subscribe(items => {
        const count = items.reduce((sum, item) => sum + item.quantity, 0);
        observer.next(count);
      });
    });
  }

  getCartItemCountSync(): number {
    const items = this.cartItemsSubject.value;
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }

  loadCartForUser(userId: string = 'user123'): void {
    this.getCartByUser(userId).subscribe({
      next: (cart) => {
        this.cartItemsSubject.next(cart.items);
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        this.cartItemsSubject.next([]);
      }
    });
  }
}
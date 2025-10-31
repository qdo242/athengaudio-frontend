import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Product } from '../interfaces/product';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_KEY = 'cart';
  private cartItemsSubject = new BehaviorSubject<CartItem[]>(this.getCartFromStorage());
  public cartItems$ = this.cartItemsSubject.asObservable();

  getCartItems(): Observable<CartItem[]> {
    return this.cartItems$;
  }

  addToCart(product: Product, quantity: number = 1): Observable<void> {
    return new Observable(observer => {
      try {
        const cartItems = this.getCartFromStorage();
        const existingItem = cartItems.find(item => item.product.id === product.id);
        
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          cartItems.push({
            product: product,
            quantity: quantity
          });
        }
        
        this.saveCartToStorage(cartItems);
        this.cartItemsSubject.next(cartItems);
        observer.next();
        observer.complete();
      } catch (error) {
        observer.error(error);
      }
    });
  }

  removeFromCart(productId: number): Observable<void> {
    return new Observable(observer => {
      try {
        let cartItems = this.getCartFromStorage();
        cartItems = cartItems.filter(item => item.product.id !== productId);
        this.saveCartToStorage(cartItems);
        this.cartItemsSubject.next(cartItems);
        observer.next();
        observer.complete();
      } catch (error) {
        observer.error(error);
      }
    });
  }

  updateQuantity(productId: number, quantity: number): Observable<void> {
    return new Observable(observer => {
      try {
        const cartItems = this.getCartFromStorage();
        const item = cartItems.find(item => item.product.id === productId);
        
        if (item) {
          item.quantity = quantity;
          this.saveCartToStorage(cartItems);
          this.cartItemsSubject.next(cartItems);
        }
        
        observer.next();
        observer.complete();
      } catch (error) {
        observer.error(error);
      }
    });
  }

  clearCart(): Observable<void> {
    return new Observable(observer => {
      try {
        localStorage.removeItem(this.CART_KEY);
        this.cartItemsSubject.next([]);
        observer.next();
        observer.complete();
      } catch (error) {
        observer.error(error);
      }
    });
  }

  getCartTotal(): Observable<number> {
    const cartItems = this.getCartFromStorage();
    const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    return of(total);
  }

  getCartItemCount(): Observable<number> {
    const cartItems = this.getCartFromStorage();
    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    return of(count);
  }

  // Method sync để lấy số lượng item (dùng trong header)
  getCartItemCountSync(): number {
    const cartItems = this.getCartFromStorage();
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  private getCartFromStorage(): CartItem[] {
    const cartData = localStorage.getItem(this.CART_KEY);
    return cartData ? JSON.parse(cartData) : [];
  }

  private saveCartToStorage(cartItems: CartItem[]): void {
    localStorage.setItem(this.CART_KEY, JSON.stringify(cartItems));
  }
}
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Subscription } from 'rxjs';
import { CartItem, CartService } from '../../services/cart';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss']
})
export class Cart implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  total: number = 0;
  isLoading: boolean = true;
  private cartSubscription: Subscription | undefined;

  constructor(
    private cartService: CartService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCartItems();
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  loadCartItems(): void {
    this.cartSubscription = this.cartService.getCartItems().subscribe({
      next: (items) => {
        this.cartItems = items;
        this.calculateTotal();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading cart items:', error);
        this.isLoading = false;
      }
    });
  }

  calculateTotal(): void {
    this.total = this.cartItems.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);
  }

  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity < 1) {
      newQuantity = 1;
    }
    
    this.cartService.updateQuantity(item.product.id, newQuantity).subscribe({
      next: () => {
        this.calculateTotal();
      },
      error: (error: any) => {
        console.error('Error updating quantity:', error);
        alert('Có lỗi xảy ra khi cập nhật số lượng!');
      }
    });
  }

  removeItem(productId: number): void {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) {
      this.cartService.removeFromCart(productId).subscribe({
        next: () => {
          // Cart items sẽ tự động cập nhật qua subscription
        },
        error: (error: any) => {
          console.error('Error removing item:', error);
          alert('Có lỗi xảy ra khi xóa sản phẩm!');
        }
      });
    }
  }

  clearCart(): void {
    if (confirm('Bạn có chắc muốn xóa tất cả sản phẩm trong giỏ hàng?')) {
      this.cartService.clearCart().subscribe({
        next: () => {
          this.cartItems = [];
          this.total = 0;
        },
        error: (error: any) => {
          console.error('Error clearing cart:', error);
          alert('Có lỗi xảy ra khi xóa giỏ hàng!');
        }
      });
    }
  }

  proceedToCheckout(): void {
    if (this.cartItems.length === 0) {
      alert('Giỏ hàng của bạn đang trống!');
      return;
    }

    if (!this.authService.isLoggedIn) {
      alert('Vui lòng đăng nhập để tiếp tục thanh toán!');
      this.router.navigate(['/login']);
      return;
    }

    this.router.navigate(['/checkout']);
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }
}
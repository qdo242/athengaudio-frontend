import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Subscription } from 'rxjs';
import { CartItem, CartService } from '../../services/cart';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.scss']
})
export class Checkout implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  total: number = 0;
  shippingFee: number = 30000; // 30,000 VND
  grandTotal: number = 0;
  isLoading: boolean = true;

  customerInfo = {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    note: ''
  };

  paymentMethod: string = 'cod';
  private cartSubscription: Subscription | undefined;

  constructor(
    private cartService: CartService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCartItems();
    this.prefillCustomerInfo();
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
        this.calculateTotals();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading cart items:', error);
        this.isLoading = false;
      }
    });
  }

  prefillCustomerInfo(): void {
    if (this.authService.currentUserValue) {
      const user = this.authService.currentUserValue;
      this.customerInfo.fullName = user.name;
      this.customerInfo.email = user.email;
      this.customerInfo.phone = user.phone || '';
      this.customerInfo.address = user.address || '';
    }
  }

  calculateTotals(): void {
    this.total = this.cartItems.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);
    
    this.grandTotal = this.total + this.shippingFee;
  }

  placeOrder(): void {
    // Validate form
    if (!this.validateForm()) {
      return;
    }

    if (this.cartItems.length === 0) {
      alert('Giỏ hàng của bạn đang trống!');
      return;
    }

    // Tạo đơn hàng
    const order = {
      id: Date.now(),
      customerInfo: { ...this.customerInfo },
      items: this.cartItems,
      total: this.total,
      shippingFee: this.shippingFee,
      grandTotal: this.grandTotal,
      paymentMethod: this.paymentMethod,
      status: 'pending',
      createdAt: new Date()
    };

    // Lưu đơn hàng vào localStorage (trong thực tế sẽ gọi API)
    this.saveOrderToStorage(order);

    // Xóa giỏ hàng
    this.cartService.clearCart().subscribe({
      next: () => {
        alert('🎉 Đặt hàng thành công! Cảm ơn bạn đã mua sắm tại AthenAudio.');
        this.router.navigate(['/order-success'], { 
          state: { orderId: order.id }
        });
      },
      error: (error: any) => {
        console.error('Error clearing cart:', error);
        alert('❌ Có lỗi xảy ra khi xử lý đơn hàng!');
      }
    });
  }

  validateForm(): boolean {
    const requiredFields = ['fullName', 'email', 'phone', 'address', 'city', 'district'];
    
    for (const field of requiredFields) {
      if (!this.customerInfo[field as keyof typeof this.customerInfo]) {
        alert(`Vui lòng điền đầy đủ thông tin ${this.getFieldLabel(field)}!`);
        return false;
      }
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.customerInfo.email)) {
      alert('Vui lòng nhập địa chỉ email hợp lệ!');
      return false;
    }

    // Validate phone
    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    if (!phoneRegex.test(this.customerInfo.phone)) {
      alert('Vui lòng nhập số điện thoại hợp lệ!');
      return false;
    }

    return true;
  }

  getFieldLabel(field: string): string {
    const labels: { [key: string]: string } = {
      fullName: 'họ tên',
      email: 'email',
      phone: 'số điện thoại',
      address: 'địa chỉ',
      city: 'thành phố',
      district: 'quận/huyện'
    };
    return labels[field] || field;
  }

  saveOrderToStorage(order: any): void {
    const savedOrders = localStorage.getItem('orders');
    const orders = savedOrders ? JSON.parse(savedOrders) : [];
    orders.unshift(order);
    localStorage.setItem('orders', JSON.stringify(orders));
  }

  goBackToCart(): void {
    this.router.navigate(['/cart']);
  }
}
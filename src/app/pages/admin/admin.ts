import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Product } from '../../interfaces/product';
import { ProductService } from '../../services/product';
import { AuthService } from '../../services/auth';


@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DecimalPipe],
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss']
})
export class Admin implements OnInit {
  products: Product[] = [];
  orders: any[] = [];
  activeTab: string = 'products';
  
  // Product Form
  showProductForm = false;
  editingProduct: Product | null = null;
  
  productForm = {
    name: '',
    price: 0,
    originalPrice: 0,
    category: 'headphone',
    subCategory: 'wireless',
    brand: 'Atheng Audio',
    description: '',
    features: [''],
    inStock: true,
    rating: 4.5,
    reviews: 0,
    connectivity: ['wireless'],
    type: 'earbuds'
  };

  // Stats
  stats = {
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    outOfStock: 0
  };

  constructor(
    private productService: ProductService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadOrders();
    this.calculateStats();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.calculateStats();
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
    });
  }

  loadOrders(): void {
    // Load orders from localStorage (in real app, from API)
    const savedOrders = localStorage.getItem('orders');
    this.orders = savedOrders ? JSON.parse(savedOrders) : this.getMockOrders();
    this.calculateStats();
  }

  getMockOrders(): any[] {
    return [
      {
        id: 1,
        customerName: 'Nguyễn Văn A',
        customerEmail: 'a@example.com',
        customerPhone: '0123456789',
        items: [
          { productId: 1, name: 'AirPods Pro 2', price: 6990000, quantity: 1 },
          { productId: 3, name: 'Sony WH-1000XM5', price: 8990000, quantity: 1 }
        ],
        total: 15980000,
        status: 'completed',
        createdAt: new Date('2024-01-15'),
        shippingAddress: '123 Đường ABC, Quận 1, TP.HCM'
      },
      {
        id: 2,
        customerName: 'Trần Thị B',
        customerEmail: 'b@example.com',
        customerPhone: '0987654321',
        items: [
          { productId: 8, name: 'HomePod Mini', price: 3990000, quantity: 2 }
        ],
        total: 7980000,
        status: 'pending',
        createdAt: new Date('2024-01-16'),
        shippingAddress: '456 Đường XYZ, Quận 2, TP.HCM'
      },
      {
        id: 3,
        customerName: 'Lê Văn C',
        customerEmail: 'c@example.com',
        customerPhone: '0912345678',
        items: [
          { productId: 4, name: 'Sony WF-1000XM4', price: 4990000, quantity: 1 },
          { productId: 9, name: 'Sony SRS-XB43', price: 3490000, quantity: 1 }
        ],
        total: 8480000,
        status: 'cancelled',
        createdAt: new Date('2024-01-14'),
        shippingAddress: '789 Đường DEF, Quận 3, TP.HCM'
      }
    ];
  }

  calculateStats(): void {
    this.stats.totalProducts = this.products.length;
    this.stats.totalOrders = this.orders.length;
    this.stats.totalRevenue = this.orders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + order.total, 0);
    this.stats.outOfStock = this.products.filter(p => !p.inStock).length;
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  // Product Management
  addProduct(): void {
    this.editingProduct = null;
    this.productForm = {
      name: '',
      price: 0,
      originalPrice: 0,
      category: 'headphone',
      subCategory: 'wireless',
      brand: 'Atheng Audio',
      description: '',
      features: [''],
      inStock: true,
      rating: 4.5,
      reviews: 0,
      connectivity: ['wireless'],
      type: 'earbuds'
    };
    this.showProductForm = true;
  }

  editProduct(product: Product): void {
  this.editingProduct = product;
  this.productForm = { 
    name: product.name,
    price: product.price,
    originalPrice: product.originalPrice || 0,
    category: product.category,
    subCategory: product.subCategory || 'wireless',
    brand: product.brand,
    description: product.description,
    features: [...(product.features || [''])],
    inStock: product.inStock,
    rating: product.rating,
    reviews: product.reviews,
    connectivity: [product.subCategory || 'wireless'],
    type: product.type || 'earbuds'
  };
  this.showProductForm = true;
}

  saveProduct(): void {
  if (this.editingProduct) {
    // Update existing product
    this.productService.updateProduct(this.editingProduct.id, this.productForm).subscribe({
      next: () => {
        this.showProductForm = false;
        this.loadProducts();
      },
      error: (error) => {
        console.error('Error updating product:', error);
      }
    });
  } else {
    // Add new product
    const newProduct: Product = {
      id: Date.now(),
      image: 'assets/images/default-product.png',
      ...this.productForm,
      originalPrice: this.productForm.originalPrice || undefined,
      subCategory: this.productForm.connectivity[0] || 'wireless'
    };
    
    this.productService.addProduct(newProduct).subscribe({
      next: () => {
        this.showProductForm = false;
        this.loadProducts();
      },
      error: (error) => {
        console.error('Error adding product:', error);
      }
    });
  }
}

  deleteProduct(productId: number): void {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      this.productService.deleteProduct(productId).subscribe({
        next: () => {
          this.loadProducts();
        },
        error: (error) => {
          console.error('Error deleting product:', error);
        }
      });
    }
  }

  cancelEdit(): void {
    this.showProductForm = false;
    this.editingProduct = null;
  }

  addFeature(): void {
    this.productForm.features.push('');
  }

  removeFeature(index: number): void {
    this.productForm.features.splice(index, 1);
  }

  trackByFn(index: number, item: any): any {
    return index;
  }

  // Order Management
  updateOrderStatus(orderId: number, event: Event): void {
    const target = event.target as HTMLSelectElement;
    const status = target.value;
    
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      order.updatedAt = new Date();
      localStorage.setItem('orders', JSON.stringify(this.orders));
      this.loadOrders();
    }
  }

  viewOrder(orderId: number): void {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      alert(`Chi tiết đơn hàng #${orderId}\nKhách hàng: ${order.customerName}\nTổng tiền: ${order.total.toLocaleString()}₫\nTrạng thái: ${this.getStatusText(order.status)}`);
    }
  }

  deleteOrder(orderId: number): void {
    if (confirm('Bạn có chắc muốn xóa đơn hàng này?')) {
      this.orders = this.orders.filter(o => o.id !== orderId);
      localStorage.setItem('orders', JSON.stringify(this.orders));
      this.loadOrders();
    }
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      pending: 'Chờ xử lý',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy',
      processing: 'Đang xử lý',
      shipped: 'Đã giao hàng'
    };
    return statusMap[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      pending: '#fbbf24',
      completed: '#10b981',
      cancelled: '#ef4444',
      processing: '#3b82f6',
      shipped: '#8b5cf6'
    };
    return colors[status] || '#6b7280';
  }

  // Category options for form
  categories = [
    { value: 'headphone', label: 'Tai nghe' },
    { value: 'speaker', label: 'Loa' }
  ];

  connectivityOptions = [
    { value: 'wireless', label: 'Không dây' },
    { value: 'wired', label: 'Có dây' },
    { value: 'both', label: 'Cả hai' }
  ];

  headphoneTypes = [
    { value: 'earbuds', label: 'Tai nghe trong tai' },
    { value: 'over-ear', label: 'Tai nghe chụp tai' },
    { value: 'on-ear', label: 'Tai nghe đặt trên tai' },
    { value: 'gaming', label: 'Tai nghe gaming' },
    { value: 'studio', label: 'Tai nghe studio' }
  ];

  brands = [
    'Apple', 'Sony', 'Samsung', 'Bose', 'JBL', 
    'Beats', 'Audio-Technica', 'Sennheiser', 'Atheng Audio'
  ];

  // User Management (placeholder)
  getUsers(): any[] {
    return [
      { id: 1, name: 'Nguyễn Văn A', email: 'a@example.com', role: 'user', joinedDate: '2024-01-01' },
      { id: 2, name: 'Trần Thị B', email: 'b@example.com', role: 'user', joinedDate: '2024-01-02' },
      { id: 3, name: 'Admin User', email: 'admin@athenaudio.com', role: 'admin', joinedDate: '2024-01-01' }
    ];
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Error logging out:', error);
      }
    });
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Product } from '../../interfaces/product';
import { ProductService } from '../../services/product';
import { AuthService } from '../../services/auth';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.scss']
})
export class ProductDetail implements OnInit {
  product: Product | undefined;
  selectedImage: string = '';
  quantity: number = 1;
  relatedProducts: Product[] = [];
  isLoading: boolean = true;
  activeTab: string = 'description';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    public authService: AuthService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const productId = params['id'];
      this.loadProduct(productId);
    });
  }

  loadProduct(productId: string): void {
    this.isLoading = true;
    this.productService.getProductById(productId).subscribe({
      next: (product) => {
        this.product = {
          ...product,
          image: product.image || 'assets/images/default-product.png',
          inStock: product.stock > 0,
          rating: product.rating || 4.5,
          reviews: product.reviews || 0,
          features: product.features || ['Chất lượng cao', 'Bảo hành chính hãng'],
          images: product.images || [product.image || 'assets/images/default-product.png']
        };
        
        if (this.product) {
          this.selectedImage = this.product.images?.[0] || this.product.image || '';
          this.loadRelatedProducts(this.product);
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading product:', error);
        this.isLoading = false;
      }
    });
  }

  loadRelatedProducts(product: Product): void {
    this.productService.getProductsByCategory(product.category).subscribe({
      next: (products) => {
        this.relatedProducts = products
          .filter(p => p.id !== product.id)
          .slice(0, 4)
          .map(p => ({
            ...p,
            image: p.image || 'assets/images/default-product.png',
            inStock: p.stock > 0
          }));
      },
      error: (error: any) => {
        console.error('Error loading related products:', error);
      }
    });
  }

  changeImage(image: string): void {
    this.selectedImage = image;
  }

  increaseQuantity(): void {
    this.quantity++;
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (this.product) {
      this.cartService.addToCartFrontend(this.product, this.quantity).subscribe({
        next: () => {
          alert('🎉 Đã thêm vào giỏ hàng!');
        },
        error: (error: any) => {
          console.error('Error adding to cart:', error);
          alert('❌ Có lỗi xảy ra khi thêm vào giỏ hàng!');
        }
      });
    }
  }

  buyNow(): void {
    if (this.product) {
      this.cartService.addToCartFrontend(this.product, this.quantity).subscribe({
        next: () => {
          this.router.navigate(['/cart']);
        },
        error: (error: any) => {
          console.error('Error adding to cart:', error);
          alert('❌ Có lỗi xảy ra! Vui lòng thử lại.');
        }
      });
    }
  }

  addToWishlist(): void {
    if (this.product && this.product.id) {
      if (this.authService.isLoggedIn) {
        this.authService.addToWishlist(Number(this.product.id)).subscribe({
          next: (response: any) => {
            if (response.success) {
              alert('❤️ ' + response.message);
            } else {
              alert('ℹ️ ' + response.message);
            }
          },
          error: (error: any) => {
            console.error('Error adding to wishlist:', error);
            alert('❌ Có lỗi xảy ra khi thêm vào wishlist!');
          }
        });
      } else {
        alert('🔐 Vui lòng đăng nhập để thêm vào danh sách yêu thích!');
        this.router.navigate(['/login']);
      }
    }
  }

  isInWishlist(): boolean {
    if (!this.authService.currentUserValue || !this.product?.id) {
      return false;
    }
    return this.authService.currentUserValue.wishlist?.includes(Number(this.product.id)) || false;
  }

  getDiscountPercent(): number {
    if (!this.product?.originalPrice) return 0;
    return Math.round(((this.product.originalPrice - this.product.price) / this.product.originalPrice) * 100);
  }

  getDiscount(): number {
    return this.getDiscountPercent();
  }

  getStarRating(rating: number): string {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars);
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  formatArray(items: string[] | undefined): string {
    if (!items || items.length === 0) return '';
    return items.join(', ');
  }

  hasSpec(spec: any): boolean {
    return spec !== undefined && spec !== null && spec !== '';
  }

  showAdminNotice(): boolean {
    return this.authService.isAdminSync();
  }
}
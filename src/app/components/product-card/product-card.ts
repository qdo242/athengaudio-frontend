import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Product } from '../../interfaces/product';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
    @Input() product! : Product;

    constructor(
      private cartService : CartService,
      private router : Router
    ){}

    getDiscount(): number {
    if (this.product.originalPrice) {
      return Math.round((1 - this.product.price / this.product.originalPrice) * 100);
    }
    return 0;
  }

  viewDetail(): void {
    this.router.navigate(['/products', this.product.id]);
  }

  addToCart(event: Event): void {
    event.stopPropagation();
    this.cartService.addToCart(this.product);
  }

  getStarRating(): string {
    const fullStars = Math.floor(this.product.rating);
    const halfStar = this.product.rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    
    return '★'.repeat(fullStars) + '½'.repeat(halfStar) + '☆'.repeat(emptyStars);
  }
}

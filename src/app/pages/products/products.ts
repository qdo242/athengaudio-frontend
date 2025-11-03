import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Product } from '../../interfaces/product';
import { ProductService } from '../../services/product';
@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  brands: string[] = [];
  headphoneTypes: string[] = [];
  
  searchTerm: string = '';
  selectedCategory: string = 'all';
  selectedBrand: string = 'all';
  selectedConnectivity: string[] = [];
  selectedType: string = 'all';
  showMobileFilters: boolean = false;
  isLoading: boolean = true;

  categories = [
    { value: 'all', label: 'Tất cả sản phẩm' },
    { value: 'headphone', label: 'Tai nghe' },
    { value: 'speaker', label: 'Loa' }
  ];

  connectivityOptions = [
    { value: 'wireless', label: 'Không dây' },
    { value: 'wired', label: 'Có dây' }
  ];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products.map(product => ({
          ...product,
          image: product.image || 'assets/images/default-product.png',
          inStock: product.stock > 0,
          rating: product.rating || 4.5,
          reviews: product.reviews || 0,
          features: product.features || ['Chất lượng cao', 'Bảo hành chính hãng']
        }));
        this.filteredProducts = this.products;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.isLoading = false;
      }
    });

    this.productService.getBrands().subscribe({
      next: (brands) => {
        this.brands = brands;
      },
      error: (error) => {
        console.error('Error loading brands:', error);
      }
    });

    this.productService.getHeadphoneTypes().subscribe({
      next: (types) => {
        this.headphoneTypes = types;
      },
      error: (error) => {
        console.error('Error loading headphone types:', error);
      }
    });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.productService.searchProducts(
      this.searchTerm,
      this.selectedCategory,
      this.selectedBrand,
      this.selectedConnectivity,
      this.selectedType
    ).subscribe({
      next: (products) => {
        this.filteredProducts = products;
      },
      error: (error) => {
        console.error('Error applying filters:', error);
      }
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  toggleConnectivity(connectivity: string): void {
    const index = this.selectedConnectivity.indexOf(connectivity);
    if (index > -1) {
      this.selectedConnectivity.splice(index, 1);
    } else {
      this.selectedConnectivity.push(connectivity);
    }
    this.onFilterChange();
  }

  toggleMobileFilters(): void {
    this.showMobileFilters = !this.showMobileFilters;
  }

  getCategoryLabel(categoryValue: string): string {
    const category = this.categories.find(c => c.value === categoryValue);
    return category ? category.label : categoryValue;
  }

  getConnectivityLabel(connectivity: string): string {
    const connectivityMap: {[key: string]: string} = {
      'wireless': 'Không dây',
      'wired': 'Có dây'
    };
    return connectivityMap[connectivity] || connectivity;
  }

  removeConnectivityFilter(conn: string): void {
    this.selectedConnectivity = this.selectedConnectivity.filter(c => c !== conn);
    this.onFilterChange();
  }

  hasActiveFilters(): boolean {
    return this.selectedCategory !== 'all' || 
           this.selectedBrand !== 'all' || 
           this.selectedConnectivity.length > 0 || 
           this.selectedType !== 'all' ||
           this.searchTerm !== '';
  }

  clearAllFilters(): void {
    this.selectedCategory = 'all';
    this.selectedBrand = 'all';
    this.selectedConnectivity = [];
    this.selectedType = 'all';
    this.searchTerm = '';
    this.onFilterChange();
  }

  getProductCount(): number {
    return this.filteredProducts.length;
  }

  isConnectivitySelected(connectivity: string): boolean {
    return this.selectedConnectivity.includes(connectivity);
  }
}
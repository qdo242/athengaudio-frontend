import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product } from '../interfaces/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private products: Product[] = [];

  constructor() {
    this.loadProductsFromStorage();
  }

  private loadProductsFromStorage(): void {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      this.products = JSON.parse(savedProducts);
    } else {
      this.products = this.getDefaultProducts();
      this.saveProductsToStorage();
    }
  }

  private saveProductsToStorage(): void {
    localStorage.setItem('products', JSON.stringify(this.products));
  }

  private getDefaultProducts(): Product[] {
    return [
      {
        id: 1,
        name: 'AirPods Pro 2',
        price: 6990000,
        originalPrice: 7990000,
        image: 'assets/images/airpods-pro2.png',
        category: 'headphone',
        subCategory: 'wireless',
        brand: 'Apple',
        description: 'Tai nghe true wireless với chất lượng âm thanh vượt trội và chống ồn chủ động',
        features: ['Chống ồn chủ động', 'Chống nước IPX4', 'Sạc không dây', 'Tai nghe trong tai', 'Touch control'],
        inStock: true,
        rating: 4.6,
        reviews: 89,
        type: 'earbuds',
        colors: ['Trắng', 'Đen'],
        weight: '5.3g mỗi tai nghe',
        batteryLife: '6 giờ (30 giờ với hộp sạc)',
        connectivity: ['Bluetooth 5.3'],
        warranty: '1 năm',
        material: 'Nhựa cao cấp',
        noiseCancellation: true,
        waterResistant: true,
        chargingTime: '1 giờ',
        compatibility: ['iPhone', 'Android', 'iPad', 'Mac'],
        includedItems: ['Tai nghe', 'Hộp sạc', 'Cáp USB-C', 'Tai nghe thay thế'],
        images: ['assets/images/airpods-pro2.png', 'assets/images/airpods-pro2-2.png']
      },
      {
        id: 2,
        name: 'Sony WH-1000XM5',
        price: 8990000,
        originalPrice: 9990000,
        image: 'assets/images/sony-wh1000xm5.png',
        category: 'headphone',
        subCategory: 'wireless',
        brand: 'Sony',
        description: 'Tai nghe chống ồn tốt nhất thế giới với chất âm tuyệt hảo',
        features: ['Chống ồn chủ động', 'Pin 30 giờ', 'Bluetooth 5.2', 'Touch control', 'Chất âm LDAC'],
        inStock: true,
        rating: 4.8,
        reviews: 124,
        type: 'over-ear',
        colors: ['Đen', 'Bạc'],
        weight: '250g',
        batteryLife: '30 giờ',
        connectivity: ['Bluetooth 5.2', 'Jack 3.5mm'],
        warranty: '2 năm',
        material: 'Nhựa và kim loại',
        dimensions: '200 x 170 x 100 mm',
        impedance: '48 ohms',
        frequencyResponse: '4Hz-40,000Hz',
        driverSize: '30mm',
        noiseCancellation: true,
        waterResistant: false,
        chargingTime: '3 giờ',
        compatibility: ['Tất cả thiết bị Bluetooth'],
        includedItems: ['Tai nghe', 'Hộp đựng', 'Cáp sạc USB-C', 'Cáp audio'],
        images: ['assets/images/sony-wh1000xm5.png', 'assets/images/sony-wh1000xm5-2.png']
      },
      // ... thêm các sản phẩm khác với đầy đủ thông số
    ];
  }

  getProducts(): Observable<Product[]> {
    return of(this.products);
  }

  getProduct(id: number): Observable<Product | undefined> {
    const product = this.products.find(p => p.id === id);
    return of(product);
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    if (category === 'all') {
      return of(this.products);
    }
    const filtered = this.products.filter(p => p.category === category);
    return of(filtered);
  }

  getProductsByBrand(brand: string): Observable<Product[]> {
    const filtered = this.products.filter(p => 
      p.brand.toLowerCase() === brand.toLowerCase()
    );
    return of(filtered);
  }

  searchProducts(query: string, category?: string, brand?: string, connectivity?: string[], type?: string): Observable<Product[]> {
    let filtered = this.products;

    if (query) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.brand.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (category && category !== 'all') {
      filtered = filtered.filter(p => p.category === category);
    }

    if (brand && brand !== 'all') {
      filtered = filtered.filter(p => p.brand === brand);
    }

    if (connectivity && connectivity.length > 0) {
      filtered = filtered.filter(p => 
        connectivity.some(conn => p.subCategory === conn || p.subCategory === 'both')
      );
    }

    if (type && type !== 'all' && (category === 'headphone' || category === 'all')) {
      filtered = filtered.filter(p => p.type === type);
    }

    return of(filtered);
  }

  getBrands(): Observable<string[]> {
    const brands = this.products.map(p => p.brand);
    const uniqueBrands = [...new Set(brands)].sort();
    return of(uniqueBrands);
  }

  getHeadphoneTypes(): Observable<string[]> {
    const types = this.products
      .filter(p => p.category === 'headphone' && p.type)
      .map(p => p.type as string);
    const uniqueTypes = [...new Set(types)].sort();
    return of(uniqueTypes);
  }

  addProduct(product: Product): Observable<void> {
    // Generate new ID if not provided
    if (!product.id) {
      product.id = Math.max(...this.products.map(p => p.id)) + 1;
    }
    this.products.unshift(product);
    this.saveProductsToStorage();
    return of();
  }

  updateProduct(productId: number, productData: Partial<Product>): Observable<void> {
    const index = this.products.findIndex(p => p.id === productId);
    if (index !== -1) {
      this.products[index] = { ...this.products[index], ...productData };
      this.saveProductsToStorage();
    }
    return of();
  }

  deleteProduct(productId: number): Observable<void> {
    this.products = this.products.filter(p => p.id !== productId);
    this.saveProductsToStorage();
    return of();
  }
}
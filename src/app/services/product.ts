import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../interfaces/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8080/api/products';

  constructor(private http: HttpClient) { }

  // Kết nối với Spring Boot API
  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  updateProduct(id: string, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/category/${category}`);
  }

  getActiveProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/active`);
  }

  getProductsByBrand(brand: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/brand/${brand}`);
  }

  // Các method cho frontend
  getBrands(): Observable<string[]> {
    return new Observable(observer => {
      this.getAllProducts().subscribe({
        next: (products) => {
          const brands = products.map(p => p.brand);
          const uniqueBrands = [...new Set(brands)].sort();
          observer.next(uniqueBrands);
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }

  getHeadphoneTypes(): Observable<string[]> {
    return new Observable(observer => {
      this.getAllProducts().subscribe({
        next: (products) => {
          const types = products
            .filter(p => p.category === 'headphone' && p.type)
            .map(p => p.type as string);
          const uniqueTypes = [...new Set(types)].sort();
          observer.next(uniqueTypes);
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }

  searchProducts(query: string, category?: string, brand?: string, connectivity?: string[], type?: string): Observable<Product[]> {
    return new Observable(observer => {
      this.getAllProducts().subscribe({
        next: (products) => {
          let filtered = products;

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

          if (type && type !== 'all' && (category === 'headphone' || category === 'all')) {
            filtered = filtered.filter(p => p.type === type);
          }

          observer.next(filtered);
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }
}
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProductsGrid } from '../../components/products-grid/products-grid';
import { Product } from '../../interfaces/product';
import { ProductService } from '../../services/product';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductsGrid],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  featuredProducts: Product[] = [];
  constructor(private productService: ProductService){}

  ngOnInit() :void {
    this.loadFeaturedProducts();
  }

  loadFeaturedProducts():void{
    this.productService.getProducts().subscribe(products=>{
      this.featuredProducts= products.slice(0,4)
    })
  }

}

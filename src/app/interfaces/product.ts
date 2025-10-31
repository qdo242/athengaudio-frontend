export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  subCategory: string;
  brand: string;
  description: string;
  features: string[];
  inStock: boolean;
  rating: number;
  reviews: number;
  type?: string;
  
  // Thêm các thuộc tính mới cho chi tiết sản phẩm
  colors?: string[];
  weight?: string;
  batteryLife?: string;
  connectivity?: string[];
  warranty?: string;
  material?: string;
  dimensions?: string;
  impedance?: string;
  frequencyResponse?: string;
  driverSize?: string;
  noiseCancellation?: boolean;
  waterResistant?: boolean;
  chargingTime?: string;
  compatibility?: string[];
  includedItems?: string[];
  images?: string[]; // Multiple images for product detail
}
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: number;
  items: CartItem[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
  customer: any;
}
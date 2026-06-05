export type UserRole = 'user' | 'vendor' | 'admin';

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  deliveryCost?: number; // One-time delivery cost for all vendor's products
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // in BHD
  image: string;
  vendorId: string;
  vendorName: string;
  discount?: number; // discount percentage
  category: 'productive_families' | 'local_projects';
}

export interface BahrainEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  image: string;
  isOffer: boolean; // True for special deals/sales, False for community events
  organizer: string;
}

export interface Order {
  id: string;
  buyer: {
    name: string;
    phone: string;
    address: string;
  };
  vendor: {
    id: string;
    name: string;
    phone: string;
  };
  products: {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
  }[];
  deliveryCost: number;
  totalAmount: number;
  paymentMethod: 'BenefitPay' | 'CashOnDelivery';
  status: 'new' | 'processing' | 'completed';
  trackingStatus: 'pending' | 'preparing' | 'with_courier' | 'delivered'; // قيد المراجعة | تم التوصيل إلخ
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AdRequest {
  id: string;
  advertiserName: string;
  whatsapp: string;
  adType: string; // e.g., 'حفلات', 'افتتاح معرض', 'مأكولات'
  title: string;
  imageUrl: string;
  durationDays: number;
  status: 'pending' | 'approved';
  createdAt: string;
}

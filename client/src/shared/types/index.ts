export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Sales' | 'Warehouse' | 'Accounts';
  isActive: boolean;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  businessName: string;
  gstNumber?: string;
  customerType: 'Retail' | 'Wholesale' | 'Distributor';
  address: string;
  status: 'Lead' | 'Active' | 'Inactive';
  followUpDate?: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerFollowUp {
  id: string;
  customerId: string;
  notes: string;
  nextFollowUpDate?: string;
  createdBy: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minStockAlert: number;
  warehouseLocation: string;
  createdBy?: string;
  createdAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  quantity: number;
  movementType: 'IN' | 'OUT';
  reason: string;
  createdBy: string;
  createdAt: string;
}

export interface ChallanItem {
  id?: string;
  productId: string;
  productNameSnapshot?: string;
  productSkuSnapshot?: string;
  productPriceSnapshot?: number;
  quantity: number;
  lineTotal: number;
}

export interface SalesChallan {
  id: string;
  challanNumber: string;
  customer: Customer | string;
  items: ChallanItem[];
  totalQuantity: number;
  totalAmount: number;
  status: 'Draft' | 'Confirmed' | 'Cancelled';
  createdBy: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStats {
  totalCustomers: number;
  totalProducts: number;
  lowStockCount: number;
  totalChallans: number;
  recentChallans: SalesChallan[];
  customersByStatus: Record<string, number>;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export type Role = "Admin" | "Shopkeeper";

export interface UserProfile {
  uid: string;
  email: string;
  role: Role;
  pin: string;
}

export interface Item {
  id: string;
  name: string;
  category: "Electrical" | "Plumbing" | "Tools" | "Fasteners" | "Paint" | "Other";
  unit: "Piece" | "Meter" | "Box" | "Kg" | "Litre";
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  dues: number;
  totalSpent: number;
}

export interface SaleItem {
  itemId: string;
  name: string;
  qty: number;
  price: number;
  total: number;
}

export interface Sale {
  id: string;
  billNo: string;
  date: string; // ISO string
  total: number;
  discount: number;
  gst: number;
  finalAmount: number;
  items: SaleItem[];
  customerId?: string;
  customerName?: string;
}

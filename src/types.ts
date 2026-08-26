export type PageRoute =
  | 'home'
  | 'buy-book'
  | 'checkout'
  | 'login'
  | 'admin'
  | 'reader'
  | 'contact'
  | 'join';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

export interface Order {
  id: string;
  userName?: string;
  email: string;
  txId: string;
  screenshotUrl: string | null;
  amountUsdt: number;
  paymentMethod?: 'usdt' | 'zinipay';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt?: string;
}

export interface ChapterMeta {
  id: string;
  number: number;
  title: string;
  readTime: string;
  hasInteractiveSimulator?: boolean;
}

export interface Chapter extends ChapterMeta {
  subtitle: string;
  keyTakeaways: string[];
  content: string;
}

export interface WatermarkInfo {
  name: string;
  email: string;
  orderId: string;
  licensedAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  content: string;
  profitGain: string;
}

export interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

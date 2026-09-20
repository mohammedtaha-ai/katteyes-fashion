export type Role = 'admin' | 'customer'
export type OrderStatus = 'new' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

export interface User { id: number; name: string; email: string; role: Role }

export interface Category { id: number; name: string; slug: string; is_active: boolean; sort_order: number; products_count?: number }

export interface ProductImage { id: number; url: string; sort_order: number }
export interface Product {
  id: number; name: string; slug: string; description: string | null
  price: number; currency: string
  category?: { id: number; slug: string; name: string }
  is_active: boolean
  images: ProductImage[]
  colors: string[]
  sizes: string[]
}

export interface OrderItem { product_name: string; price: number; color: string; size: string; quantity: number; subtotal: number }
export interface Order {
  order_number: string; status: OrderStatus
  customer_name: string; customer_email: string | null; customer_address: string; customer_notes: string | null
  subtotal: number; total: number; currency: string
  whatsapp_link: string; created_at: string
  items: OrderItem[]
}

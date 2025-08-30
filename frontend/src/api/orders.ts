import { shopClient } from "./shop-mutator"

// Types for order operations
export interface OrderCreateData {
  order_number?: string
  status: "pending" | "confirmed" | "shipped" | "delivered"
  subtotal: string
  shipping_cost: string
  total: string
  shipping_address: number
  shipping_method: number
  applied_coupon?: number
  coupon_discount?: string
  notes?: string
}

export interface OrderUpdateData extends Partial<OrderCreateData> {
  id: string | number
}

// API functions for orders
export const checkoutOrdersCreate = async (data: OrderCreateData) => {
  const response = await shopClient.post("/api/checkout/orders/", data)
  return response.data
}

export const checkoutOrdersUpdate = async (id: string | number, data: Partial<OrderCreateData>) => {
  const response = await shopClient.put(`/api/checkout/orders/${id}/`, data)
  return response.data
}

export const checkoutOrdersPartialUpdate = async (id: string | number, data: Partial<OrderCreateData>) => {
  const response = await shopClient.patch(`/api/checkout/orders/${id}/`, data)
  return response.data
}

export const checkoutOrdersDestroy = async (id: string | number) => {
  const response = await shopClient.delete(`/api/checkout/orders/${id}/`)
  return response.data
}

// React Query hooks for orders mutations
export const useCheckoutOrdersCreate = () => {
  return {
    mutateAsync: checkoutOrdersCreate,
    isPending: false, // You can implement proper loading state if needed
    error: null
  }
}

export const useCheckoutOrdersUpdate = () => {
  return {
    mutateAsync: checkoutOrdersUpdate,
    isPending: false,
    error: null
  }
}

export const useCheckoutOrdersDestroy = () => {
  return {
    mutateAsync: checkoutOrdersDestroy,
    isPending: false,
    error: null
  }
}

/**
 * Generated by orval v7.10.0 🍺
 * Do not edit manually.
 * ShopDjango API
 * API for ShopDjango project
 * OpenAPI spec version: 1.0.0
 */
import type { CartList } from './cartList';

export interface PaginatedCartListList {
  count: number;
  /** @nullable */
  next?: string | null;
  /** @nullable */
  previous?: string | null;
  results: CartList[];
}



// Base entity interface for all CRUD items
export interface BaseEntity {
  id: string | number
  created_at?: string
  updated_at?: string
}

// Interface for items that can be identified by name/title
export interface IdentifiableItem extends BaseEntity {
  name?: string
  title?: string
}

// Generic item name getter function type
export type ItemNameGetter<T> = (item: T) => string

// Generic item ID getter function type
export type ItemIdGetter<T> = (item: T) => string | number

// API error types
export interface ApiError {
  message: string
  status?: number
  code?: string
  details?: Record<string, any>
}

// Pagination and response types
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>


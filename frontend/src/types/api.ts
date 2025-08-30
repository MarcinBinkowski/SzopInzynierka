/**
 * Standard API response types for consistent handling across the application
 */

export interface PaginatedResponse<T> {
  count: number
  next?: string | null
  previous?: string | null
  results: T[]
}

// Simple response structure (for APIs without pagination)
export interface SimpleResponse<T> {
  data: T[]
}

// Union type for all possible response types
export type ApiResponse<T> = PaginatedResponse<T> | T[] | SimpleResponse<T>

// Type guard to check if response is paginated
export function isPaginatedResponse<T>(response: any): response is PaginatedResponse<T> {
  return response && typeof response === 'object' && 'results' in response && 'count' in response
}

// Type guard to check if response is simple
export function isSimpleResponse<T>(response: any): response is SimpleResponse<T> {
  return response && typeof response === 'object' && 'data' in response && !('results' in response)
}

// Helper to extract data from any response type
export function extractDataFromResponse<T>(response: ApiResponse<T>): T[] {
  if (isPaginatedResponse(response)) {
    return response.results
  }
  if (isSimpleResponse(response)) {
    return response.data
  }
  if (Array.isArray(response)) {
    return response
  }
  return []
}

// Helper to get count from response
export function getCountFromResponse<T>(response: ApiResponse<T>): number {
  if (isPaginatedResponse(response)) {
    return response.count
  }
  if (isSimpleResponse(response)) {
    return response.data.length
  }
  if (Array.isArray(response)) {
    return response.length
  }
  return 0
}

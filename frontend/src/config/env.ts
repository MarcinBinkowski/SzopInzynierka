/**
 * Environment configuration
 * Centralizes all environment variables and provides type safety
 */
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  shopApiUrl: import.meta.env.VITE_SHOP_API_URL || 'http://localhost:8000',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;

export type Config = typeof config;
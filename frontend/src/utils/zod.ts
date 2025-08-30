import { z } from "zod"

/**
 * Utility function to determine if a field is required based on Zod schema
 * @param schema The Zod schema object
 * @param fieldName The name of the field to check
 * @returns true if the field is required, false if it's optional
 */
export function isFieldRequired<T extends z.ZodObject<any>>(schema: T, fieldName: keyof z.infer<T>): boolean {
  const shape = schema.shape
  const field = shape[fieldName]
  
  if (!field) return false
  
  // Check if the field has .optional() or .nullish() modifiers
  return !(field instanceof z.ZodOptional || field instanceof z.ZodNullable || field instanceof z.ZodNull)
}

import { z } from "zod";

export function isFieldRequired<T extends z.ZodObject<any>>(
  schema: T,
  fieldName: keyof z.infer<T>,
): boolean {
  const shape = schema.shape;
  const field = shape[fieldName];

  if (!field) return false;

  return !(
    field instanceof z.ZodOptional ||
    field instanceof z.ZodNullable ||
    field instanceof z.ZodNull
  );
}

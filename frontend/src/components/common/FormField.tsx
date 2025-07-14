import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { UseFormRegisterReturn, FieldError } from "react-hook-form";
import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  id: string;
  placeholder?: string;
  error?: FieldError;
  disabled?: boolean;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  type?:
    | "text"
    | "number"
    | "email"
    | "password"
    | "url"
    | "date"
    | "datetime-local";
  step?: string;
  register: UseFormRegisterReturn;
  rightElement?: ReactNode;
  hint?: string;
}

export function FormField({
  label,
  id,
  placeholder,
  error,
  disabled = false,
  required = false,
  multiline = false,
  rows = 4,
  type = "text",
  step,
  register,
  rightElement,
  hint,
}: FormFieldProps) {
  const Component = multiline ? Textarea : Input;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {rightElement ? (
        <div className="flex gap-2 items-start">
          <Component
            id={id}
            placeholder={placeholder}
            disabled={disabled}
            rows={multiline ? rows : undefined}
            type={multiline ? undefined : type}
            step={step}
            {...register}
          />
          {rightElement}
        </div>
      ) : (
        <Component
          id={id}
          placeholder={placeholder}
          disabled={disabled}
          rows={multiline ? rows : undefined}
          type={multiline ? undefined : type}
          step={step}
          {...register}
        />
      )}
      {error && <p className="text-sm text-red-500">{String(error.message)}</p>}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

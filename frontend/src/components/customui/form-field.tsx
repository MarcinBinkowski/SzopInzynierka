import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { UseFormRegisterReturn, FieldError } from "react-hook-form"

interface FormFieldProps {
  label: string
  id: string
  placeholder?: string
  error?: FieldError
  disabled?: boolean
  required?: boolean
  multiline?: boolean
  rows?: number
  type?: "text" | "number" | "email" | "password"
  register: UseFormRegisterReturn
}

export function FormField({
  label,
  id,
  placeholder,
  error,
  disabled = false,
  multiline = false,
  rows = 4,
  type = "text",
  register
}: FormFieldProps) {
  const Component = multiline ? Textarea : Input

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
      </Label>
      <Component
        id={id}
        placeholder={placeholder}
        disabled={disabled}
        rows={multiline ? rows : undefined}
        type={multiline ? undefined : type}
        {...register}
      />
      {error && (
        <p className="text-sm text-red-500">{String(error.message)}</p>
      )}
    </div>
  )
} 
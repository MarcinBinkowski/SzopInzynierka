import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FieldError } from "react-hook-form"

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface FormSelectProps {
  label: string
  id: string
  placeholder?: string
  error?: FieldError
  disabled?: boolean
  required?: boolean
  value: string
  onValueChange: (value: string) => void
  options: SelectOption[]
}

export function FormSelect({
  label,
  id,
  placeholder,
  error,
  disabled = false,
  required = false,
  value,
  onValueChange,
  options
}: FormSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-red-500">{String(error.message)}</p>
      )}
    </div>
  )
} 
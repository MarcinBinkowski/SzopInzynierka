import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/customui/DatePicker"
import { FieldError } from "react-hook-form"

interface DateFieldProps {
  label: string
  id: string
  date?: Date | null
  onDateChange: (date: Date | null) => void
  placeholder?: string
  error?: FieldError
  disabled?: boolean
}

export function DateField({ 
  label, 
  id, 
  date, 
  onDateChange, 
  placeholder, 
  error, 
  disabled 
}: DateFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <DatePicker
        date={date || undefined}
        onDateChange={(date) => onDateChange(date || null)}
        placeholder={placeholder}
        disabled={disabled}
      />
      {error && (
        <p className="text-sm text-red-500">{error.message}</p>
      )}
    </div>
  )
}

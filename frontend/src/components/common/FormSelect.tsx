import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isFieldRequired } from "@/utils/zod";
import { z } from "zod";

interface SelectOption {
  value: string | number;
  label: string;
}

interface FormSelectProps {
  label: string;
  value?: string | number | null;
  onValueChange: (value: string | number | null) => void;
  options: SelectOption[];
  disabled?: boolean;
  error?: string;
  required?: boolean;
  schema?: z.ZodSchema<any>;
  fieldName?: string;
  placeholder?: string;
  className?: string;
  id?: string;
  isLoading?: boolean;
}

export function FormSelect({
  label,
  value,
  onValueChange,
  options,
  disabled = false,
  error,
  required = false,
  schema,
  fieldName,
  placeholder = "Select an option",
  className = "",
  id,
  isLoading = false,
}: FormSelectProps) {
  const isRequired = required || (schema && fieldName ? isFieldRequired(schema as any, fieldName) : false);
  const fieldId = id || fieldName || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={fieldId} className="text-sm font-medium">
        {label}{" "}
        {isRequired && <span className="text-red-500">*</span>}
      </label>
      <Select
        value={value?.toString() || ""}
        onValueChange={(value) => onValueChange(value ? (typeof value === 'string' && !isNaN(Number(value)) ? Number(value) : value) : null)}
        disabled={disabled || isLoading}
      >
        <SelectTrigger>
          <SelectValue placeholder={isLoading ? "Loading..." : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value.toString()}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FieldError } from "react-hook-form";

interface CheckboxFieldProps {
  id: string;
  label: string;
  checked?: boolean;
  onCheckedChange: (checked: boolean) => void;
  description?: string;
  error?: FieldError;
  disabled?: boolean;
}

export function CheckboxField({
  id,
  label,
  checked = false,
  onCheckedChange,
  description,
  error,
  disabled,
}: CheckboxFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
        />
        <Label
          htmlFor={id}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </Label>
      </div>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  );
}

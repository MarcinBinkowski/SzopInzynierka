import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  UseFormRegisterReturn,
  UseFormWatch,
  UseFormSetValue,
  UseFormTrigger,
} from "react-hook-form";

interface SlugFieldProps {
  register: UseFormRegisterReturn;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  trigger: UseFormTrigger<any>;
  sourceField: string;
  error?: any;
  disabled?: boolean;
  required?: boolean;
}

export function SlugField({
  register,
  watch,
  setValue,
  trigger,
  sourceField,
  error,
  disabled,
  required = false,
}: SlugFieldProps) {
  const generateSlug = () => {
    const sourceValue = watch(sourceField);
    if (sourceValue) {
      const generatedSlug = sourceValue
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setValue("slug", generatedSlug);
      trigger("slug");
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="slug">
        Slug
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="flex gap-2">
        <Input
          id="slug"
          {...register}
          placeholder="Enter slug"
          disabled={disabled}
          aria-required={required}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={generateSlug}
          disabled={disabled || !watch(sourceField)}
          className="whitespace-nowrap"
        >
          Generate
        </Button>
      </div>
      {error && <p className="text-sm text-red-500">{error.message}</p>}
      <p className="text-xs text-muted-foreground">
        Only letters, numbers, hyphens, and underscores allowed
      </p>
    </div>
  );
}

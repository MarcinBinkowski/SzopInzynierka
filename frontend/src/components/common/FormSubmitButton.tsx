import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/common/Spinner";

interface FormSubmitButtonProps {
  isSubmitting?: boolean;
  submitButtonText?: string;
  disabled?: boolean;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export function FormSubmitButton({
  isSubmitting = false,
  submitButtonText = "Save",
  disabled = false,
  className = "",
  variant = "default",
  size = "default",
}: FormSubmitButtonProps) {
  return (
    <Button
      type="submit"
      disabled={isSubmitting || disabled}
      aria-busy={isSubmitting}
      variant={variant}
      size={size}
      className={className}
    >
      {isSubmitting ? (
        <>
          <Spinner className="mr-2 h-4 w-4" />
          {submitButtonText}
        </>
      ) : (
        submitButtonText
      )}
    </Button>
  );
}

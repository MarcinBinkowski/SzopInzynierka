"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/common/Spinner";

interface FormLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
  onSubmit?: () => void;
  onCancel?: () => void;
  submitButtonText?: string;
  cancelButtonText?: string;
  isSubmitting?: boolean;
  submitDisabled?: boolean;
}

export function FormLayout({
  title,
  description,
  children,
  onSubmit,
  onCancel,
  submitButtonText = "Save",
  cancelButtonText = "Cancel",
  isSubmitting = false,
  submitDisabled = false,
}: FormLayoutProps) {
  const actions =
    onSubmit || onCancel ? (
      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {cancelButtonText}
          </Button>
        )}
        {onSubmit && (
          <Button
            type="submit"
            disabled={isSubmitting || submitDisabled}
            aria-busy={isSubmitting}
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
        )}
      </div>
    ) : null;

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        {children}
        {actions}
      </CardContent>
    </Card>
  );
}

"use client";

import React, { ReactNode } from "react";
import { FormProvider, useForm, UseFormReturn, FieldValues, DefaultValues, Resolver } from "react-hook-form";
import { z, ZodTypeAny } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodTypeDef } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/customui/Spinner";
import { toast } from "sonner";

type ValuesOf<S extends ZodTypeAny> = z.infer<S>;

type OnSubmitHelpers<V extends FieldValues> = {
  reset: UseFormReturn<V>["reset"];
  setError: UseFormReturn<V>["setError"];
};

interface GenericFormProps<S extends ZodTypeAny> {
  title: string;
  description?: string;
  schema: S;
  /** Initial values (reinitialize when this object identity changes) */
  initialData?: Partial<ValuesOf<S>>;
  /** Submit handler (can be async). Throw or return rejected promise to trigger root error toast. */
  onSubmit: (data: ValuesOf<S>, helpers: OnSubmitHelpers<ValuesOf<S>>) => Promise<unknown> | unknown;
  /** Called when user cancels */
  onCancel?: () => void;
  submitButtonText?: string;
  cancelButtonText?: string;
  isSubmitting?: boolean;
  children: (form: UseFormReturn<ValuesOf<S>>) => ReactNode;
}

export function GenericForm<S extends ZodTypeAny>({
  title,
  description,
  schema,
  initialData,
  onSubmit,
  submitButtonText = "Save",
  cancelButtonText = "Cancel",
  isSubmitting: externalIsSubmitting,
  onCancel,
  children,
}: GenericFormProps<S>) {
  type V = ValuesOf<S>;

  const form = useForm<V>({
    resolver: zodResolver(schema) as Resolver<V, ZodTypeDef, V>,
    defaultValues: initialData as DefaultValues<V> | undefined,
    mode: "onChange",
    shouldUnregister: false,
  });

  const {
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting: hookIsSubmitting, errors },
  } = form;

  const isSubmitting = externalIsSubmitting ?? hookIsSubmitting;

  React.useEffect(() => {
    if (initialData) {
      reset(initialData as DefaultValues<V>);
    }
  }, [initialData, reset]);

  const onCancelClick = () => {
    onCancel?.();
  };

  const onSubmitForm = async (data: V) => {
    try {
      await onSubmit(data, { reset, setError });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred while submitting the form.";
      setError("root", { type: "server", message });
      toast.error(message);
    }
  };

  const defaultActions = (
    <div className="flex justify-end gap-2 pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancelClick}
        disabled={isSubmitting}
      >
        {cancelButtonText}
      </Button>
      <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
        {isSubmitting ? (
          <>
            <Spinner className="mr-2 h-4 w-4" />
            {submitButtonText}
          </>
        ) : (
          submitButtonText
        )}
      </Button>
    </div>
  );

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>

      <CardContent>
        {/* Root-level error */}
        {"root" in errors && (errors as any).root?.message && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-4 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {(errors as any).root.message}
          </div>
        )}

        <FormProvider {...form}>
          <form
            onSubmit={handleSubmit(onSubmitForm)}
            className="space-y-4"
            noValidate
          >
            {children(form)}
            {defaultActions}
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}

import { FormField } from "@/components/common/FormField";
import { FormSubmitButton } from "@/components/common/FormSubmitButton";
import { FormLayout } from "@/components/common/FormLayout";
import { z } from "zod";
import type { Courier } from "@/api/generated/shop/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isFieldRequired } from "@/utils/zod";
import {
  checkoutCouriersCreateBody,
  checkoutCouriersUpdateBody,
} from "@/api/generated/shop/checkout/checkout.zod";

export type CourierCreateData = z.infer<typeof checkoutCouriersCreateBody>;
export type CourierUpdateData = z.infer<typeof checkoutCouriersUpdateBody>;
export type CourierFormData = CourierCreateData | CourierUpdateData;

interface CourierFormProps {
  title: string;
  description: string;
  initialData?: Courier;
  onSubmit: (data: CourierFormData) => Promise<void>;
  submitButtonText: string;
  isSubmitting?: boolean;
  onCancel: () => void;
}

export function CourierForm({
  title,
  description,
  initialData,
  onSubmit,
  submitButtonText,
  isSubmitting,
  onCancel,
}: CourierFormProps) {
  const isEditMode = !!initialData;
  const schema = isEditMode
    ? checkoutCouriersUpdateBody
    : checkoutCouriersCreateBody;

  const form = useForm<CourierFormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData ? { name: initialData.name } : undefined,
  });

  const handleSubmit = form.handleSubmit(async (data: CourierFormData) => {
    await onSubmit(data);
  });

  return (
    <FormLayout
      title={title}
      description={description}
      onCancel={onCancel}
      submitButtonText={submitButtonText}
      isSubmitting={isSubmitting}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Name"
            id="name"
            register={form.register("name")}
            error={form.formState.errors.name}
            disabled={form.formState.isSubmitting}
            required={isFieldRequired(schema, "name")}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <FormSubmitButton
            isSubmitting={isSubmitting}
            submitButtonText={submitButtonText}
          />
        </div>
      </form>
    </FormLayout>
  );
}

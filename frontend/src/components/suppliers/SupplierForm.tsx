import { FormField } from "@/components/common/FormField";
import { FormSubmitButton } from "@/components/common/FormSubmitButton";
import { FormLayout } from "@/components/common/FormLayout";
import { z } from "zod";
import type { Supplier } from "@/api/generated/shop/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isFieldRequired } from "@/utils/zod";
import {
  catalogSuppliersCreateBody,
  catalogSuppliersUpdateBody,
} from "@/api/generated/shop/catalog/catalog.zod";

export type SupplierCreateData = z.infer<typeof catalogSuppliersCreateBody>;
export type SupplierUpdateData = z.infer<typeof catalogSuppliersUpdateBody>;
export type SupplierFormData = SupplierCreateData | SupplierUpdateData;

interface SupplierFormProps {
  title: string;
  description: string;
  initialData?: Supplier;
  onSubmit: (data: SupplierFormData) => Promise<void>;
  submitButtonText: string;
  isSubmitting?: boolean;
  onCancel: () => void;
}

export function SupplierForm({
  title,
  description,
  initialData,
  onSubmit,
  submitButtonText,
  isSubmitting,
  onCancel,
}: SupplierFormProps) {
  const isEditMode = !!initialData;
  const schema = isEditMode
    ? catalogSuppliersUpdateBody
    : catalogSuppliersCreateBody;

  const form = useForm<SupplierFormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          contact_email: (initialData as any).contact_email,
          phone: (initialData as any).phone,
        }
      : undefined,
  });

  const handleSubmit = form.handleSubmit(async (data: SupplierFormData) => {
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

          <FormField
            label="Contact Email"
            id="contact_email"
            type="email"
            register={form.register("contact_email")}
            error={form.formState.errors.contact_email}
            disabled={form.formState.isSubmitting}
            required={isFieldRequired(schema, "contact_email")}
          />

          <FormField
            label="Phone"
            id="phone"
            register={form.register("phone")}
            error={form.formState.errors.phone}
            disabled={form.formState.isSubmitting}
            required={isFieldRequired(schema, "phone")}
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

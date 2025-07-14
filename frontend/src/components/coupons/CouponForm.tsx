import { FormField } from "@/components/common/FormField";
import { FormSubmitButton } from "@/components/common/FormSubmitButton";
import {
  checkoutCouponsCreateBody,
  checkoutCouponsUpdateBody,
} from "@/api/generated/shop/checkout/checkout.zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormLayout } from "@/components/common/FormLayout";
import type { Coupon } from "@/api/generated/shop/schemas";
import { z } from "zod";
import { isFieldRequired } from "@/utils/zod";

type CouponCreateData = z.infer<typeof checkoutCouponsCreateBody>;
type CouponUpdateData = z.infer<typeof checkoutCouponsUpdateBody>;
type CouponFormData = CouponCreateData | CouponUpdateData;

interface CouponFormProps {
  title: string;
  description: string;
  initialData?: Coupon;
  onSubmit: (data: CouponFormData) => Promise<void>;
  submitButtonText: string;
  isSubmitting?: boolean;
  onCancel: () => void;
}

export function CouponForm({
  title,
  description,
  initialData,
  onSubmit,
  submitButtonText,
  isSubmitting,
  onCancel,
}: CouponFormProps) {
  const isEditMode = !!initialData;
  const schema = isEditMode
    ? checkoutCouponsUpdateBody
    : checkoutCouponsCreateBody;

  const form = useForm<CouponFormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData
      ? {
          code: initialData.code,
          name: initialData.name,
          description: initialData.description || "",
          discount_amount: initialData.discount_amount,
          max_uses: initialData.max_uses || undefined,
          max_uses_per_user: initialData.max_uses_per_user || undefined,
          valid_from: initialData.valid_from
            ? new Date(initialData.valid_from).toISOString().slice(0, 16)
            : "",
          valid_until: initialData.valid_until
            ? new Date(initialData.valid_until).toISOString().slice(0, 16)
            : "",
        }
      : undefined,
  });

  const handleSubmit = form.handleSubmit(async (data: CouponFormData) => {
    const transformedData = {
      ...data,
      max_uses: data.max_uses ? Number(data.max_uses) : undefined,
      max_uses_per_user: data.max_uses_per_user
        ? Number(data.max_uses_per_user)
        : undefined,
      valid_from: data.valid_from
        ? new Date(data.valid_from).toISOString()
        : "",
      valid_until: data.valid_until
        ? new Date(data.valid_until).toISOString()
        : "",
    };
    await onSubmit(transformedData);
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
            label="Code"
            id="code"
            register={form.register("code")}
            error={form.formState.errors.code}
            disabled={form.formState.isSubmitting}
            required={isFieldRequired(schema, "code")}
          />

          <FormField
            label="Name"
            id="name"
            register={form.register("name")}
            error={form.formState.errors.name}
            disabled={form.formState.isSubmitting}
            required={isFieldRequired(schema, "name")}
          />
        </div>

        <FormField
          label="Description"
          id="description"
          register={form.register("description")}
          error={form.formState.errors.description}
          disabled={form.formState.isSubmitting}
          multiline
          rows={3}
          required={isFieldRequired(schema, "description")}
        />

        <FormField
          label="Discount Amount"
          id="discount_amount"
          register={form.register("discount_amount")}
          error={form.formState.errors.discount_amount}
          disabled={form.formState.isSubmitting}
          required={isFieldRequired(schema, "discount_amount")}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Max Uses"
            id="max_uses"
            type="number"
            register={form.register("max_uses", {
              setValueAs: (value) => (value === "" ? undefined : Number(value)),
            })}
            error={form.formState.errors.max_uses}
            disabled={form.formState.isSubmitting}
            required={isFieldRequired(schema, "max_uses")}
          />

          <FormField
            label="Max Uses Per User"
            id="max_uses_per_user"
            type="number"
            register={form.register("max_uses_per_user", {
              setValueAs: (value) => (value === "" ? undefined : Number(value)),
            })}
            error={form.formState.errors.max_uses_per_user}
            disabled={form.formState.isSubmitting}
            required={isFieldRequired(schema, "max_uses_per_user")}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Valid From"
            id="valid_from"
            type="datetime-local"
            register={form.register("valid_from", {
              setValueAs: (value) =>
                value === "" ? "" : new Date(value).toISOString(),
            })}
            error={form.formState.errors.valid_from}
            disabled={form.formState.isSubmitting}
            required={isFieldRequired(schema, "valid_from")}
          />

          <FormField
            label="Valid Until"
            id="valid_until"
            type="datetime-local"
            register={form.register("valid_until", {
              setValueAs: (value) =>
                value === "" ? "" : new Date(value).toISOString(),
            })}
            error={form.formState.errors.valid_until}
            disabled={form.formState.isSubmitting}
            required={isFieldRequired(schema, "valid_until")}
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

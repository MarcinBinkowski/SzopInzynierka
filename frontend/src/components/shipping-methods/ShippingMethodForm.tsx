import { FormField } from "@/components/common/FormField";
import { FormLayout } from "@/components/common/FormLayout";
import { FormSelect } from "@/components/common/FormSelect";
import { FormSubmitButton } from "@/components/common/FormSubmitButton";
import { z } from "zod";
import type { ShippingMethod } from "@/api/generated/shop/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isFieldRequired } from "@/utils/zod";
import {
  checkoutShippingMethodsCreateBody,
  checkoutShippingMethodsUpdateBody,
} from "@/api/generated/shop/checkout/checkout.zod";
import { useCheckoutCouriersList } from "@/api/generated/shop/checkout/checkout";

export type ShippingMethodCreateData = z.infer<
  typeof checkoutShippingMethodsCreateBody
>;
export type ShippingMethodUpdateData = z.infer<
  typeof checkoutShippingMethodsUpdateBody
>;
export type ShippingMethodFormData =
  | ShippingMethodCreateData
  | ShippingMethodUpdateData;

interface ShippingMethodFormProps {
  title: string;
  description: string;
  initialData?: ShippingMethod;
  onSubmit: (data: ShippingMethodFormData) => Promise<void>;
  submitButtonText: string;
  isSubmitting?: boolean;
  onCancel: () => void;
}

export function ShippingMethodForm({
  title,
  description,
  initialData,
  onSubmit,
  submitButtonText,
  isSubmitting,
  onCancel,
}: ShippingMethodFormProps) {
  const isEditMode = !!initialData;
  const schema = isEditMode
    ? checkoutShippingMethodsUpdateBody
    : checkoutShippingMethodsCreateBody;

  const { data: couriersData, isLoading: couriersLoading } =
    useCheckoutCouriersList();

  const form = useForm<ShippingMethodFormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          price: initialData.price,
          courier: initialData.courier,
        }
      : undefined,
  });

  const handleSubmit = form.handleSubmit(
    async (data: ShippingMethodFormData) => {
      const transformedData: ShippingMethodFormData = {
        ...data,
        price: String((data as any).price ?? ""),
      };
      await onSubmit(transformedData);
    },
  );

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
            label="Price"
            id="price"
            register={form.register("price", {
              setValueAs: (v) => (v == null ? "" : String(v)),
            })}
            error={form.formState.errors.price}
            disabled={form.formState.isSubmitting}
            required={isFieldRequired(schema, "price")}
          />

          <FormSelect
            label="Courier"
            value={form.watch("courier")}
            onValueChange={(value) => form.setValue("courier", value as number)}
            options={couriersData?.results?.map((courier) => ({
              value: courier.id,
              label: courier.name,
            })) || []}
            disabled={form.formState.isSubmitting}
            isLoading={couriersLoading}
            error={form.formState.errors.courier?.message}
            schema={schema}
            fieldName="courier"
            placeholder="Select a courier"
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

import { FormField } from "@/components/common/FormField";
import { FormSubmitButton } from "@/components/common/FormSubmitButton";
import { FormLayout } from "@/components/common/FormLayout";
import { z } from "zod";
import type { Shipment } from "@/api/generated/shop/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isFieldRequired } from "@/utils/zod";
import { checkoutShipmentsUpdateBody } from "@/api/generated/shop/checkout/checkout.zod";

export type ShipmentUpdateData = z.infer<typeof checkoutShipmentsUpdateBody>;

interface ShipmentFormProps {
  title: string;
  description: string;
  initialData: Shipment;
  onSubmit: (data: ShipmentUpdateData) => Promise<void>;
  submitButtonText: string;
  isSubmitting?: boolean;
  onCancel: () => void;
}

export function ShipmentForm({
  title,
  description,
  initialData,
  onSubmit,
  submitButtonText,
  isSubmitting,
  onCancel,
}: ShipmentFormProps) {
  const form = useForm<ShipmentUpdateData>({
    resolver: zodResolver(checkoutShipmentsUpdateBody),
    defaultValues: {
      shipped_at: initialData.shipped_at ? new Date(initialData.shipped_at).toISOString().slice(0, 16) : "",
      delivered_at: initialData.delivered_at ? new Date(initialData.delivered_at).toISOString().slice(0, 16) : "",
      shipping_address: initialData.shipping_address,
    },
  });

  const handleSubmit = form.handleSubmit(async (data: ShipmentUpdateData) => {
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
        {initialData && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h3 className="font-medium text-gray-900">Order Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Order ID:</span>{" "}
                {initialData.order}
              </div>
              <div>
                <span className="font-medium">Shipping Method:</span>{" "}
                {initialData.shipping_method || "N/A"}
              </div>
              <div>
                <span className="font-medium">Courier:</span>{" "}
                {initialData.courier || "N/A"}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Order</label>
            <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
              Order #{initialData.order}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Shipping Method</label>
            <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
              {initialData.shipping_method || "N/A"}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Courier</label>
            <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
              {initialData.courier || "N/A"}
            </div>
          </div>

          <FormField
            label="Shipped At"
            id="shipped_at"
            type="datetime-local"
            register={form.register("shipped_at", {
              setValueAs: (v) => (v && v !== "" ? new Date(v).toISOString() : null),
            })}
            error={form.formState.errors.shipped_at}
            disabled={form.formState.isSubmitting}
            required={isFieldRequired(
              checkoutShipmentsUpdateBody,
              "shipped_at",
            )}
          />

          <FormField
            label="Delivered At"
            id="delivered_at"
            type="datetime-local"
            register={form.register("delivered_at", {
              setValueAs: (v) => (v && v !== "" ? new Date(v).toISOString() : null),
            })}
            error={form.formState.errors.delivered_at}
            disabled={form.formState.isSubmitting}
            required={isFieldRequired(
              checkoutShipmentsUpdateBody,
              "delivered_at",
            )}
          />

          <FormField
            label="Shipping Address"
            id="shipping_address"
            multiline
            rows={4}
            register={form.register("shipping_address")}
            error={form.formState.errors.shipping_address}
            disabled={form.formState.isSubmitting}
            required={isFieldRequired(
              checkoutShipmentsUpdateBody,
              "shipping_address",
            )}
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

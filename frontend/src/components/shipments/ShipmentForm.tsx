"use client"

import { FormField } from "@/components/customui/FormField"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/customui/Spinner"
import { FormLayout } from "@/components/common/FormLayout"
import { z } from "zod"
import type { Shipment } from "@/api/generated/shop/schemas"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { isFieldRequired } from "@/utils/zod"
import { checkoutShipmentsCreateBody, checkoutShipmentsUpdateBody } from "@/api/generated/shop/checkout/checkout.zod"

export type ShipmentCreateData = z.infer<typeof checkoutShipmentsCreateBody>
export type ShipmentUpdateData = z.infer<typeof checkoutShipmentsUpdateBody>
export type ShipmentFormData = ShipmentCreateData | ShipmentUpdateData

interface ShipmentFormProps {
  title: string
  description: string
  initialData?: Shipment
  onSubmit: (data: ShipmentFormData) => Promise<void>
  submitButtonText: string
  isSubmitting?: boolean
  onCancel: () => void
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
  const isEditMode = !!initialData
  const schema = isEditMode ? checkoutShipmentsUpdateBody : checkoutShipmentsCreateBody

  const form = useForm<ShipmentFormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData
      ? {
          order: (initialData as any).order,
          shipping_method: (initialData as any).shipping_method,
          courier: (initialData as any).courier,
          shipped_at: initialData.shipped_at,
          delivered_at: (initialData as any).delivered_at ?? undefined,
          shipping_address: (initialData as any).shipping_address,
        }
      : undefined,
  })

  const handleSubmit = form.handleSubmit(async (data: ShipmentFormData) => {
    await onSubmit(data)
  })

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
            label="Order ID"
            id="order"
            register={form.register("order", { setValueAs: (v) => v == null || v === "" ? undefined : Number(v) })}
            error={form.formState.errors.order}
            disabled={form.formState.isSubmitting}
            required={isFieldRequired(schema, "order")}
          />

          <FormField
            label="Shipping Method ID"
            id="shipping_method"
            register={form.register("shipping_method", { setValueAs: (v) => v == null || v === "" ? undefined : Number(v) })}
            error={form.formState.errors.shipping_method}
            disabled={form.formState.isSubmitting}
            required={isFieldRequired(schema, "shipping_method")}
          />

          <FormField
            label="Courier ID"
            id="courier"
            register={form.register("courier", { setValueAs: (v) => v == null || v === "" ? undefined : Number(v) })}
            error={form.formState.errors.courier}
            disabled={form.formState.isSubmitting}
            required={isFieldRequired(schema, "courier")}
          />

          <FormField
            label="Shipped At"
            id="shipped_at"
            type="datetime-local"
            register={form.register("shipped_at", { setValueAs: (v) => v ? new Date(v).toISOString() : undefined })}
            error={form.formState.errors.shipped_at}
            disabled={form.formState.isSubmitting}
            required={isFieldRequired(schema, "shipped_at")}
          />

          <FormField
            label="Delivered At"
            id="delivered_at"
            type="datetime-local"
            register={form.register("delivered_at", { setValueAs: (v) => v ? new Date(v).toISOString() : undefined })}
            error={form.formState.errors.delivered_at}
            disabled={form.formState.isSubmitting}
            required={isFieldRequired(schema, "delivered_at")}
          />

          <FormField
            label="Shipping Address"
            id="shipping_address"
            multiline
            rows={4}
            register={form.register("shipping_address")}
            error={form.formState.errors.shipping_address}
            disabled={form.formState.isSubmitting}
            required={isFieldRequired(schema, "shipping_address")}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
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
      </form>
    </FormLayout>
  )
}



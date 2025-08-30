"use client"

import { FormField } from "@/components/customui/FormField"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/customui/Spinner"
import { FormLayout } from "@/components/common/FormLayout"
import { z } from "zod"
import type { ProductDelivery } from "@/api/generated/shop/schemas"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { isFieldRequired } from "@/utils/zod"
import { catalogDeliveriesCreateBody, catalogDeliveriesUpdateBody } from "@/api/generated/shop/catalog/catalog.zod"

export type ProductDeliveryCreateData = z.infer<typeof catalogDeliveriesCreateBody>
export type ProductDeliveryUpdateData = z.infer<typeof catalogDeliveriesUpdateBody>
export type ProductDeliveryFormData = ProductDeliveryCreateData | ProductDeliveryUpdateData

interface ProductDeliveryFormProps {
  title: string
  description: string
  initialData?: ProductDelivery
  onSubmit: (data: ProductDeliveryFormData) => Promise<void>
  submitButtonText: string
  isSubmitting?: boolean
  onCancel: () => void
}

export function ProductDeliveryForm({
  title,
  description,
  initialData,
  onSubmit,
  submitButtonText,
  isSubmitting,
  onCancel,
}: ProductDeliveryFormProps) {
  const isEditMode = !!initialData
  const schema = isEditMode ? catalogDeliveriesUpdateBody : catalogDeliveriesCreateBody

  const form = useForm<ProductDeliveryFormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData
      ? {
          supplier: (initialData as any).supplier,
          product: (initialData as any).product,
          quantity: initialData.quantity,
          delivery_date: initialData.delivery_date,
          cost_per_unit: initialData.cost_per_unit,
        }
      : undefined,
  })

  const handleSubmit = form.handleSubmit(async (data: ProductDeliveryFormData) => {
    const transformed = {
      ...data,
      cost_per_unit: String((data as any).cost_per_unit ?? ""),
    } as ProductDeliveryFormData
    await onSubmit(transformed)
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
            label="Supplier ID"
            id="supplier"
            register={form.register("supplier", { setValueAs: (v) => v == null || v === "" ? undefined : Number(v) })}
            error={form.formState.errors.supplier}
            disabled={form.formState.isSubmitting}
            required={isFieldRequired(schema, "supplier")}
          />

          <FormField
            label="Product ID"
            id="product"
            register={form.register("product", { setValueAs: (v) => v == null || v === "" ? undefined : Number(v) })}
            error={form.formState.errors.product}
            disabled={form.formState.isSubmitting}
            required={isFieldRequired(schema, "product")}
          />

          <FormField
            label="Quantity"
            id="quantity"
            type="number"
            register={form.register("quantity", { setValueAs: (v) => v == null || v === "" ? undefined : Number(v) })}
            error={form.formState.errors.quantity}
            disabled={form.formState.isSubmitting}
            required={isFieldRequired(schema, "quantity")}
          />

          <FormField
            label="Delivery Date"
            id="delivery_date"
            type="datetime-local"
            register={form.register("delivery_date", { setValueAs: (v) => v ? new Date(v).toISOString() : undefined })}
            error={form.formState.errors.delivery_date}
            disabled={form.formState.isSubmitting}
            required={isFieldRequired(schema, "delivery_date")}
          />

          <FormField
            label="Cost per Unit"
            id="cost_per_unit"
            register={form.register("cost_per_unit", { setValueAs: (v) => v == null ? "" : String(v) })}
            error={form.formState.errors.cost_per_unit}
            disabled={form.formState.isSubmitting}
            required={isFieldRequired(schema, "cost_per_unit")}
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



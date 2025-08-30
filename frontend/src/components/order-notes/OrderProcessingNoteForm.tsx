"use client"

import { FormField } from "@/components/customui/FormField"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/customui/Spinner"
import { FormLayout } from "@/components/common/FormLayout"
import { z } from "zod"
import type { OrderProcessingNote } from "@/api/generated/shop/schemas"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { isFieldRequired } from "@/utils/zod"
import { checkoutOrderNotesCreateBody, checkoutOrderNotesUpdateBody } from "@/api/generated/shop/checkout/checkout.zod"

export type OrderNoteCreateData = z.infer<typeof checkoutOrderNotesCreateBody>
export type OrderNoteUpdateData = z.infer<typeof checkoutOrderNotesUpdateBody>
export type OrderNoteFormData = OrderNoteCreateData | OrderNoteUpdateData

interface OrderNoteFormProps {
  title: string
  description: string
  initialData?: OrderProcessingNote
  onSubmit: (data: OrderNoteFormData) => Promise<void>
  submitButtonText: string
  isSubmitting?: boolean
  onCancel: () => void
}

export function OrderProcessingNoteForm({
  title,
  description,
  initialData,
  onSubmit,
  submitButtonText,
  isSubmitting,
  onCancel,
}: OrderNoteFormProps) {
  const isEditMode = !!initialData
  const schema = isEditMode ? checkoutOrderNotesUpdateBody : checkoutOrderNotesCreateBody

  const form = useForm<OrderNoteFormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData
      ? {
          order: (initialData as any).order,
          staff_member: (initialData as any).staff_member,
          note: (initialData as any).note,
        }
      : undefined,
  })

  const handleSubmit = form.handleSubmit(async (data: OrderNoteFormData) => {
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
            label="Staff Member ID"
            id="staff_member"
            register={form.register("staff_member", { setValueAs: (v) => v == null || v === "" ? undefined : Number(v) })}
            error={form.formState.errors.staff_member}
            disabled={form.formState.isSubmitting}
            required={isFieldRequired(schema, "staff_member")}
          />

          <FormField
            label="Note"
            id="note"
            multiline
            rows={4}
            register={form.register("note")}
            error={form.formState.errors.note}
            disabled={form.formState.isSubmitting}
            required={isFieldRequired(schema, "note")}
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



"use client"

import { catalogManufacturersCreateBody, catalogManufacturersUpdateBody } from "@/api/generated/shop/catalog/catalog.zod"
import type { Manufacturer } from '@/api/generated/shop/schemas'
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormLayout } from "@/components/common/FormLayout"
import { FormField } from "@/components/customui/FormField"
import { SwitchField } from "@/components/customui/SwitchField"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/customui/Spinner"
import { isFieldRequired } from "@/utils/zod"

type ManufacturerCreateData = z.infer<typeof catalogManufacturersCreateBody>
type ManufacturerUpdateData = z.infer<typeof catalogManufacturersUpdateBody>
type ManufacturerFormData = ManufacturerCreateData | ManufacturerUpdateData

interface ManufacturerFormProps {
  title: string
  description: string
  initialData?: Partial<Manufacturer>
  onSubmit: (data: ManufacturerFormData) => Promise<void>
  submitButtonText: string
  isSubmitting?: boolean
  onCancel: () => void
}

export function ManufacturerForm({
  title,
  description,
  initialData,
  onSubmit,
  submitButtonText,
  isSubmitting,
  onCancel
}: ManufacturerFormProps) {
  const schema = initialData?.id ? catalogManufacturersUpdateBody : catalogManufacturersCreateBody
  
  const form = useForm<ManufacturerFormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData,
  })

  const handleSubmit = form.handleSubmit(async (data: ManufacturerFormData) => {
    await onSubmit(data)
  })

  return (
    <FormLayout
      title={title}
      description={description}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Name"
          id="name"
          placeholder="Enter manufacturer name"
          register={form.register('name')}
          error={form.formState.errors.name}
          disabled={form.formState.isSubmitting}
          required={isFieldRequired(schema, 'name')}
        />

        <FormField
          label="Description"
          id="description"
          placeholder="Enter manufacturer description (optional)"
          register={form.register('description')}
          error={form.formState.errors.description}
          disabled={form.formState.isSubmitting}
          required={isFieldRequired(schema, 'description')}
        />

        <FormField
          label="Website (optional)"
          id="website"
          type="url"
          placeholder="https://example.com"
          register={form.register('website')}
          error={form.formState.errors.website}
          disabled={form.formState.isSubmitting}
          required={isFieldRequired(schema, 'website')}
        />
        <p className="text-xs text-muted-foreground">
          Manufacturer website URL (optional)
        </p>

        <SwitchField
          id="is_active"
          label="Active"
          description="Is this manufacturer visible?"
          checked={form.watch('is_active') || false}
          onCheckedChange={value => form.setValue('is_active', value)}
          disabled={form.formState.isSubmitting}
        />

        {/* Form Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
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
        </div>
      </form>
    </FormLayout>
  )
} 
"use client"

import { catalogTagsCreateBody, catalogTagsUpdateBody } from "@/api/generated/shop/catalog/catalog.zod"
import type { Tag } from '@/api/generated/shop/schemas'
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormLayout } from "@/components/common/FormLayout"
import { FormField } from "@/components/customui/FormField"
import { SlugField } from "@/components/customui/SlugField"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/customui/Spinner"
import { isFieldRequired } from "@/utils/zod"

type TagCreateData = z.infer<typeof catalogTagsCreateBody>
type TagUpdateData = z.infer<typeof catalogTagsUpdateBody>
type TagFormData = TagCreateData | TagUpdateData

interface TagFormProps {
  title: string
  description: string
  initialData?: Partial<Tag>
  onSubmit: (data: TagFormData) => Promise<void>
  submitButtonText: string
  isSubmitting?: boolean
  onCancel: () => void
}

export function TagForm({
  title,
  description,
  initialData,
  onSubmit,
  submitButtonText,
  isSubmitting,
  onCancel
}: TagFormProps) {
  const schema = initialData?.id ? catalogTagsUpdateBody : catalogTagsCreateBody
  
  const form = useForm<TagFormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData,
  })

  const handleSubmit = form.handleSubmit(async (data: TagFormData) => {
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
          placeholder="Enter tag name"
          register={form.register('name')}
          error={form.formState.errors.name}
          disabled={form.formState.isSubmitting}
          required={isFieldRequired(schema, 'name')}
        />

        <SlugField
          register={form.register('slug')}
          watch={form.watch}
          setValue={form.setValue}
          trigger={form.trigger}
          sourceField="name"
          error={form.formState.errors.slug}
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
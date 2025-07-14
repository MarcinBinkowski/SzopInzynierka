"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/customui/spinner"
import { catalogTagsCreateBody, catalogTagsUpdateBody } from "@/api/generated/shop/catalog/catalog.zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import type { Tag } from '@/api/generated/shop/schemas'
import { z } from "zod"
import { toast } from "sonner"

// Use the generated Zod schema types
type TagFormData = z.infer<typeof catalogTagsCreateBody>

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
  isSubmitting: externalIsSubmitting,
  onCancel
}: TagFormProps) {
  const schema = initialData?.id ? catalogTagsUpdateBody : catalogTagsCreateBody
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: hookIsSubmitting, isValid },
    watch,
    setValue,
    reset,
    trigger
  } = useForm<TagFormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData,
    mode: 'onChange'
  })

  const isSubmitting = externalIsSubmitting ?? hookIsSubmitting

  // Reset form when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      reset(initialData)
    }
  }, [initialData, reset])

  const onSubmitForm = async (data: TagFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
        if (error instanceof Error) {
            toast.error(`Form submission failed: ${error.message}`)
          } else {
            toast.error("An unexpected error occurred")
          }    
        }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Enter tag name"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <div className="flex gap-2">
              <Input
                id="slug"
                {...register('slug')}
                placeholder="Enter tag slug"
                disabled={isSubmitting}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const nameValue = watch('name')
                  if (nameValue) {
                    const generatedSlug = nameValue
                      .toLowerCase()
                      .trim()
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/^-+|-+$/g, '')
                    setValue('slug', generatedSlug)
                    // Trigger validation for the slug field
                    trigger('slug')
                  }
                }}
                disabled={isSubmitting || !watch('name')}
                className="whitespace-nowrap"
              >
                Generate
              </Button>
            </div>
            {errors.slug && (
              <p className="text-sm text-red-500">{errors.slug.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Only letters, numbers, hyphens, and underscores allowed
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || !isValid}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                submitButtonText
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 
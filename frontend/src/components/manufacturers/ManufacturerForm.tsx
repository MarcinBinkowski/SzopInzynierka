"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/customui/spinner"
import { catalogManufacturersCreateBody, catalogManufacturersUpdateBody } from "@/api/generated/shop/catalog/catalog.zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import type { Manufacturer } from '@/api/generated/shop/schemas'
import { z } from "zod"
import { toast } from "sonner"

// Use the generated Zod schema types
// ManufacturerFormData is for create, but update is compatible
// (id is readonly and not in the form)
type ManufacturerFormData = z.infer<typeof catalogManufacturersCreateBody>

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
  isSubmitting: externalIsSubmitting,
  onCancel
}: ManufacturerFormProps) {
  const isEditMode = !!initialData?.id
  const schema = isEditMode ? catalogManufacturersUpdateBody : catalogManufacturersCreateBody
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: hookIsSubmitting, isValid },
    reset
  } = useForm<ManufacturerFormData>({
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

  const onSubmitForm = async (data: ManufacturerFormData) => {
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
              placeholder="Enter manufacturer name"
              disabled={isSubmitting}
              maxLength={100}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              {...register('description')}
              placeholder="Enter manufacturer description (optional)"
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              {...register('website')}
              placeholder="https://example.com"
              disabled={isSubmitting}
              maxLength={200}
            />
            {errors.website && (
              <p className="text-sm text-red-500">{errors.website.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Manufacturer website URL (optional)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="is_active">Active</Label>
            <input
              id="is_active"
              type="checkbox"
              {...register('is_active')}
              disabled={isSubmitting}
              className="w-4 h-4 align-middle mr-2"
            />
            <span className="text-sm text-muted-foreground">Is this manufacturer visible?</span>
            {errors.is_active && (
              <p className="text-sm text-red-500">{errors.is_active.message}</p>
            )}
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
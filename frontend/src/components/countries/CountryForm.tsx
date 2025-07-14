"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/customui/spinner"
import { geographicCountriesCreateBody, geographicCountriesUpdateBody } from "@/api/generated/shop/geographic/geographic.zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import type { Country } from '@/api/generated/shop/schemas'
import { z } from "zod"
import { toast } from "sonner"

// Use the generated Zod schema types
// CountryFormData is for create, but update is compatible
// (id is readonly and not in the form)
type CountryFormData = z.infer<typeof geographicCountriesCreateBody>

interface CountryFormProps {
  title: string
  description: string
  initialData?: Partial<Country>
  onSubmit: (data: CountryFormData) => Promise<void>
  submitButtonText: string
  isSubmitting?: boolean
  onCancel: () => void
}

export function CountryForm({
  title,
  description,
  initialData,
  onSubmit,
  submitButtonText,
  isSubmitting: externalIsSubmitting,
  onCancel
}: CountryFormProps) {
  const isEditMode = !!initialData?.id
  const schema = isEditMode ? geographicCountriesUpdateBody : geographicCountriesCreateBody
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: hookIsSubmitting, isValid },
    reset
  } = useForm<CountryFormData>({
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

  const onSubmitForm = async (data: CountryFormData) => {
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
            <Label htmlFor="code">Country Code</Label>
            <Input
              id="code"
              {...register('code')}
              placeholder="Enter country code (e.g., US, GB, PL)"
              disabled={isSubmitting}
              maxLength={2}
            />
            {errors.code && (
              <p className="text-sm text-red-500">{errors.code.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Two-letter ISO country code (e.g., US, GB, PL)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Country Name</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Enter country name"
              disabled={isSubmitting}
              maxLength={100}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Official country name in English
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
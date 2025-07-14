"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/customui/spinner"
import { DatePicker } from "@/components/customui/date-picker"
import { profileProfilesCreateBody, profileProfilesUpdateBody } from "@/api/generated/shop/profile/profile.zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import type { Profile } from '@/api/generated/shop/schemas'
import { z } from "zod"
import { toast } from "sonner"

// Use the generated Zod schema types
// ProfileFormData is for create, but update is compatible
// (id is readonly and not in the form)
export type ProfileFormData = z.infer<typeof profileProfilesCreateBody>
export type ProfileUpdateData = z.infer<typeof profileProfilesUpdateBody>

interface ProfileFormProps {
  title: string
  description: string
  initialData?: Partial<Profile>
  onSubmit: (data: ProfileFormData | ProfileUpdateData) => Promise<void>
  submitButtonText: string
  isSubmitting?: boolean
  onCancel: () => void
}

export function ProfileForm({
  title,
  description,
  initialData,
  onSubmit,
  submitButtonText,
  isSubmitting: externalIsSubmitting,
  onCancel
}: ProfileFormProps) {
  const isEditMode = !!initialData?.id
  const schema = isEditMode ? profileProfilesUpdateBody : profileProfilesCreateBody
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: hookIsSubmitting, isValid },
    reset,
    setValue,
    watch
  } = useForm<ProfileFormData | ProfileUpdateData>({
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

  const onSubmitForm = async (data: ProfileFormData | ProfileUpdateData) => {
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
          {!initialData?.id && (
            <div className="space-y-2">
              <Label htmlFor="user">User ID</Label>
              <Input
                id="user"
                type="number"
                {...register('user', { valueAsNumber: true })}
                placeholder="Enter user ID"
                disabled={isSubmitting}
              />
              {'user' in errors && errors.user && (
                <p className="text-sm text-red-500">{errors.user.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              {...register('first_name')}
              placeholder="Enter first name"
              disabled={isSubmitting}
            />
            {errors.first_name && (
              <p className="text-sm text-red-500">{errors.first_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              {...register('last_name')}
              placeholder="Enter last name"
              disabled={isSubmitting}
            />
            {errors.last_name && (
              <p className="text-sm text-red-500">{errors.last_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Date of Birth</Label>
            <DatePicker
              date={watch('date_of_birth') ? new Date(watch('date_of_birth')!) : undefined}
              onDateChange={(date) => {
                setValue('date_of_birth', date ? date.toISOString().split('T')[0] : null)
              }}
              placeholder="Select date of birth"
              disabled={isSubmitting}
            />
            {errors.date_of_birth && (
              <p className="text-sm text-red-500">{errors.date_of_birth.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              id="phone_number"
              {...register('phone_number')}
              placeholder="Enter phone number with country code"
              disabled={isSubmitting}
            />
            {errors.phone_number && (
              <p className="text-sm text-red-500">{errors.phone_number.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Include country code (e.g., +1234567890)
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
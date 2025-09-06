"use client"

import { profileProfilesCreateBody, profileProfilesUpdateBody } from "@/api/generated/shop/profile/profile.zod"
import type { Profile } from '@/api/generated/shop/schemas'
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormLayout } from "@/components/common/FormLayout"
import { FormField } from "@/components/customui/FormField"
import { DateField } from "@/components/customui/DateField"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/customui/Spinner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { isFieldRequired } from "@/utils/zod"

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
  isSubmitting,
  onCancel
}: ProfileFormProps) {
  const schema = initialData?.id ? profileProfilesUpdateBody : profileProfilesCreateBody
  
  const form = useForm<ProfileFormData | ProfileUpdateData>({
    resolver: zodResolver(schema),
    defaultValues: initialData,
  })

  // Role options based on Profile.Role enum (1=ADMIN, 2=EMPLOYEE, 3=USER)
  const roleOptions = [
    { value: 1, label: "Admin" },
    { value: 2, label: "Employee" },
    { value: 3, label: "User" },
  ]

  const handleSubmit = form.handleSubmit(async (data: ProfileFormData | ProfileUpdateData) => {
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
        {!initialData?.id && (
          <div className="space-y-2">
            <label htmlFor="user" className="text-sm font-medium">User ID</label>
            <input
              id="user"
              type="number"
              {...form.register('user' as any, { valueAsNumber: true })}
              placeholder="Enter user ID"
              disabled={form.formState.isSubmitting}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        )}

        <FormField
          label="First Name"
          id="first_name"
          placeholder="Enter first name"
          register={form.register('first_name')}
          error={form.formState.errors.first_name}
          disabled={form.formState.isSubmitting}
          required={isFieldRequired(schema, 'first_name')}
        />

        <FormField
          label="Last Name"
          id="last_name"
          placeholder="Enter last name"
          register={form.register('last_name')}
          error={form.formState.errors.last_name}
          disabled={form.formState.isSubmitting}
          required={isFieldRequired(schema, 'last_name')}
        />

        <DateField
          label="Date of Birth"
          id="date_of_birth"
          date={form.watch('date_of_birth') ? new Date(form.watch('date_of_birth')!) : null}
          onDateChange={(date) => {
            form.setValue('date_of_birth', date ? date.toISOString().split('T')[0] : null)
          }}
          placeholder="Select date of birth"
          error={form.formState.errors.date_of_birth}
          disabled={form.formState.isSubmitting}
        />

        <FormField
          label="Phone Number"
          id="phone_number"
          placeholder="Enter phone number with country code"
          register={form.register('phone_number')}
          error={form.formState.errors.phone_number}
          disabled={form.formState.isSubmitting}
          required={isFieldRequired(schema, 'phone_number')}
        />
        <p className="text-xs text-muted-foreground">
          Include country code (e.g., +1234567890)
        </p>

        {initialData?.id && (
          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium">
              Role {isFieldRequired(schema, 'role') && <span className="text-red-500">*</span>}
            </label>
            <Select
              value={form.watch('role')?.toString() || ""}
              onValueChange={(value) => form.setValue('role', parseInt(value))}
              disabled={form.formState.isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.role && (
              <p className="text-sm text-red-600">{form.formState.errors.role.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Change the user's access level
            </p>
          </div>
        )}

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
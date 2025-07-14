"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/customui/form-field"
import { Spinner } from "@/components/customui/spinner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import type { Address } from '@/api/generated/shop/schemas'
import { z } from "zod"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useGeographicCountriesList, geographicCountriesList } from "@/api/generated/shop/geographic/geographic"
import { useProfileProfilesList, profileProfilesList } from "@/api/generated/shop/profile/profile"
import { AsyncPaginateSelect, OptionType } from "@/components/customui/AsyncPaginateSelect"
import { SingleValue } from "react-select"
import { profileAddressesCreateBody, profileAddressesUpdateBody } from "@/api/generated/shop/profile/profile.zod"

type AddressCreateData = z.infer<typeof profileAddressesCreateBody>
type AddressUpdateData = z.infer<typeof profileAddressesUpdateBody>
type AddressFormData = AddressCreateData | AddressUpdateData

interface AddressFormProps {
  title: string
  description: string
  initialData?: Address
  onSubmit: (data: AddressFormData) => Promise<void>
  submitButtonText: string
  isSubmitting?: boolean
  onCancel: () => void
}

export function AddressForm({
  title,
  description,
  initialData,
  onSubmit,
  submitButtonText,
  isSubmitting: externalIsSubmitting,
  onCancel,
}: AddressFormProps) {
  const isEditMode = !!initialData
  
  const schema = isEditMode ? profileAddressesUpdateBody : profileAddressesCreateBody
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: hookIsSubmitting },
    reset,
    setValue,
    watch
  } = useForm<AddressFormData & { profile?: number }>({
    resolver: zodResolver(schema),
    defaultValues: {
      address: "",
      city: "",
      postal_code: "",
      country: 1,
      ...(isEditMode ? {} : { address_type: "shipping" as const }),
      is_default: false,
      label: "",
      profile: initialData?.profile?.id,
    },
    mode: 'onChange'
  })

  const isSubmitting = externalIsSubmitting ?? hookIsSubmitting

  // Fetch profiles and countries
  const { data: profilesData, isLoading: profilesLoading } = useProfileProfilesList(undefined, {
    query: { enabled: true }
  })
  const { data: defaultCountries } = useGeographicCountriesList({ page: 1, page_size: 50 })
  const defaultCountryOptions = defaultCountries?.results?.map(c => ({ value: c.id, label: c.name })) || []

  // Initialize form with initialData
  useEffect(() => {
    if (initialData) {
      reset({
        address: initialData.address,
        city: initialData.city,
        postal_code: initialData.postal_code,
        country: initialData.country,
        address_type: initialData.address_type,
        is_default: initialData.is_default || false,
        label: initialData.label || "",
        profile: initialData.profile?.id,
      })
    }
  }, [initialData, reset])

  const handleFormSubmit = async (data: AddressFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error("Form submission error:", error)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Address Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Profile Selector */}
            <div>
              <label htmlFor="profile" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                User Profile
              </label>
              <AsyncPaginateSelect
                value={(() => {
                  const profileId = watch("profile")
                  if (!profileId) return null
                  const profile = profilesData?.results?.find(p => p.id === profileId)
                  return profile ? { value: profile.id, label: profile.user_email } : null
                })()}
                onChange={(option) => {
                  setValue("profile", option?.value || undefined)
                }}
                isDisabled={profilesLoading || isSubmitting}
                error={errors.profile && String(errors.profile.message)}
                placeholder="Select user profile"
                isMulti={false}
                fetcher={profileProfilesList}
                mapOption={profile => ({ value: profile.id, label: profile.user_email })}
                defaultOptions={profilesData?.results?.map(p => ({ value: p.id, label: p.user_email })) || []}
                instanceId="profile-async-paginate"
              />
              {profilesLoading && (
                <p className="text-sm text-muted-foreground">Loading user profiles...</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Street Address"
                id="address"
                placeholder="123 Main St, Apt 4B"
                register={register("address")}
                error={errors.address}
                disabled={isSubmitting}
              />

              <FormField
                label="City"
                id="city"
                placeholder="New York"
                register={register("city")}
                error={errors.city}
                disabled={isSubmitting}
              />

              <FormField
                label="Postal Code"
                id="postal_code"
                placeholder="10001"
                register={register("postal_code")}
                error={errors.postal_code}
                disabled={isSubmitting}
              />

              <div>
                <label htmlFor="country" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Country
                </label>
                <AsyncPaginateSelect
                  value={(() => {
                    const id = watch("country")
                    if (!id) return null
                    const country = defaultCountries?.results?.find(c => c.id === id)
                    return country ? { value: country.id, label: country.name } : null
                  })()}
                  onChange={(option: SingleValue<OptionType>) => setValue("country", option ? option.value : 1)}
                  isDisabled={isSubmitting}
                  error={errors.country && String(errors.country.message)}
                  placeholder="Select country"
                  isMulti={false}
                  fetcher={geographicCountriesList}
                  mapOption={c => ({ value: c.id, label: c.name })}
                  defaultOptions={defaultCountryOptions}
                  instanceId="country-async-paginate"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!isEditMode && (
                <div>
                  <label htmlFor="address_type" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Address Type
                  </label>
                  <Select
                    value={watch("address_type")}
                    onValueChange={(value) => setValue("address_type", value as "shipping" | "billing")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select address type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shipping">Shipping</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                    </SelectContent>
                  </Select>
                  {(errors as any).address_type && (
                    <p className="text-sm text-red-600">
                      {(errors as any).address_type.message}
                    </p>
                  )}
                </div>
              )}

              <FormField
                label="Label (Optional)"
                id="label"
                placeholder="Home, Office, etc."
                register={register("label")}
                error={errors.label}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_default"
                checked={watch("is_default")}
                onCheckedChange={(checked) => setValue("is_default", checked as boolean)}
              />
              <label htmlFor="is_default" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Set as default address
              </label>
            </div>
            {errors.is_default && (
              <p className="text-sm text-red-600">
                {errors.is_default.message}
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner size="sm" className="mr-2" />
                {submitButtonText}...
              </>
            ) : (
              submitButtonText
            )}
          </Button>
        </div>
      </div>
    </form>
  )
} 
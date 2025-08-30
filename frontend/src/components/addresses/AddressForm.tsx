"use client"

import { FormField } from "@/components/customui/FormField"
import { CheckboxField } from "@/components/customui/CheckboxField"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/customui/Spinner"
import { useGeographicCountriesList, geographicCountriesList } from "@/api/generated/shop/geographic/geographic"
import { AsyncPaginateSelect, OptionType } from "@/components/customui/AsyncPaginateSelect"
import { SingleValue } from "react-select"
import { profileAddressesCreateBody, profileAddressesUpdateBody } from "@/api/generated/shop/profile/profile.zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormLayout } from "@/components/common/FormLayout"
import type { Address } from '@/api/generated/shop/schemas'
import { z } from "zod"

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
  isSubmitting,
  onCancel,
}: AddressFormProps) {
  const isEditMode = !!initialData
  const schema = isEditMode ? profileAddressesUpdateBody : profileAddressesCreateBody
  
  const form = useForm<AddressFormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData,
  })

  const handleSubmit = form.handleSubmit(async (data: AddressFormData) => {
    await onSubmit(data)
  })

  // Fetch countries
  const { data: defaultCountries } = useGeographicCountriesList({})
  const defaultCountryOptions = defaultCountries?.map(c => ({ value: c.id, label: c.name })) || []

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
            label="Street Address"
            id="address"
            placeholder="123 Main St, Apt 4B"
            register={form.register("address")}
            error={form.formState.errors.address}
            disabled={form.formState.isSubmitting}
          />

          <FormField
            label="City"
            id="city"
            placeholder="New York"
            register={form.register("city")}
            error={form.formState.errors.city}
            disabled={form.formState.isSubmitting}
          />

          <FormField
            label="Postal Code"
            id="postal_code"
            placeholder="10001"
            register={form.register("postal_code")}
            error={form.formState.errors.postal_code}
            disabled={form.formState.isSubmitting}
          />

          <div>
            <label htmlFor="country" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Country
            </label>
            <AsyncPaginateSelect
              value={(() => {
                const id = form.watch("country")
                if (!id) return null
                const country = defaultCountries?.find(c => c.id === id)
                return country ? { value: country.id, label: country.name } : null
              })()}
              onChange={(option: SingleValue<OptionType>) => {
                if (option) {
                  form.setValue("country", option.value)
                }
              }}
              isDisabled={form.formState.isSubmitting}
              error={form.formState.errors.country?.message}
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
          <FormField
            label="Label (Optional)"
            id="label"
            placeholder="Home, Office, etc."
            register={form.register("label")}
            error={form.formState.errors.label}
            disabled={form.formState.isSubmitting}
          />
        </div>

        <CheckboxField
          id="is_default"
          label="Set as default address"
          checked={form.watch("is_default") || false}
          onCheckedChange={value => form.setValue("is_default", value)}
          error={form.formState.errors.is_default}
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
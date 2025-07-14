import { FormField } from "@/components/common/FormField";
import { CheckboxField } from "@/components/common/CheckboxField";
import { FormSelect } from "@/components/common/FormSelect";
import { FormSubmitButton } from "@/components/common/FormSubmitButton";
import { useGeographicCountriesList } from "@/api/generated/shop/geographic/geographic";
import {
  profileAddressesCreateBody,
  profileAddressesUpdateBody,
} from "@/api/generated/shop/profile/profile.zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormLayout } from "@/components/common/FormLayout";
import type { Address } from "@/api/generated/shop/schemas";
import { z } from "zod";

type AddressCreateData = z.infer<typeof profileAddressesCreateBody>;
type AddressUpdateData = z.infer<typeof profileAddressesUpdateBody>;
type AddressFormData = AddressCreateData | AddressUpdateData;

interface AddressFormProps {
  title: string;
  description: string;
  initialData?: Address;
  onSubmit: (data: AddressFormData) => Promise<void>;
  submitButtonText: string;
  isSubmitting?: boolean;
  onCancel: () => void;
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
  const isEditMode = !!initialData;
  const schema = isEditMode
    ? profileAddressesUpdateBody
    : profileAddressesCreateBody;

  const form = useForm<AddressFormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData,
  });

  const handleSubmit = form.handleSubmit(async (data: AddressFormData) => {
    await onSubmit(data);
  });

  const { data: defaultCountries } = useGeographicCountriesList({});

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

            <FormSelect
              label="Country"
              value={form.watch("country")}
              onValueChange={(value) => form.setValue("country", value as number)}
              options={defaultCountries?.map((country) => ({
                value: country.id,
                label: country.name,
              })) || []}
              disabled={form.formState.isSubmitting}
              error={form.formState.errors.country?.message}
              schema={schema}
              fieldName="country"
              placeholder="Select a country"
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Label"
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
          onCheckedChange={(value) => form.setValue("is_default", value)}
          error={form.formState.errors.is_default}
          disabled={form.formState.isSubmitting}
        />

        <div className="flex justify-end gap-2 pt-4">
          <FormSubmitButton
            isSubmitting={isSubmitting}
            submitButtonText={submitButtonText}
          />
        </div>
      </form>
    </FormLayout>
  );
}

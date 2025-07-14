import {
  geographicCountriesCreateBody,
  geographicCountriesUpdateBody,
} from "@/api/generated/shop/geographic/geographic.zod";
import type { Country } from "@/api/generated/shop/schemas";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormLayout } from "@/components/common/FormLayout";
import { FormField } from "@/components/common/FormField";
import { FormSubmitButton } from "@/components/common/FormSubmitButton";
import { isFieldRequired } from "@/utils/zod";

type CountryCreateData = z.infer<typeof geographicCountriesCreateBody>;
type CountryUpdateData = z.infer<typeof geographicCountriesUpdateBody>;
type CountryFormData = CountryCreateData | CountryUpdateData;

interface CountryFormProps {
  title: string;
  description: string;
  initialData?: Partial<Country>;
  onSubmit: (data: CountryFormData) => Promise<void>;
  submitButtonText: string;
  isSubmitting?: boolean;
  onCancel: () => void;
}

export function CountryForm({
  title,
  description,
  initialData,
  onSubmit,
  submitButtonText,
  isSubmitting,
  onCancel,
}: CountryFormProps) {
  const schema = initialData?.id
    ? geographicCountriesUpdateBody
    : geographicCountriesCreateBody;

  const form = useForm<CountryFormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData,
  });

  const handleSubmit = form.handleSubmit(async (data: CountryFormData) => {
    await onSubmit(data);
  });

  return (
    <FormLayout
      title={title}
      description={description}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <FormField
            label="Country Code"
            id="code"
            placeholder="Enter country code (e.g., US, GB, PL)"
            register={form.register("code")}
            error={form.formState.errors.code}
            disabled={form.formState.isSubmitting}
            required={isFieldRequired(schema, "code")}
          />
          <p className="text-xs text-muted-foreground">
            Two-letter ISO country code (e.g., US, GB, PL)
          </p>
        </div>

        <div className="space-y-2">
          <FormField
            label="Country Name"
            id="name"
            placeholder="Enter country name"
            register={form.register("name")}
            error={form.formState.errors.name}
            disabled={form.formState.isSubmitting}
            required={isFieldRequired(schema, "name")}
          />
          <p className="text-xs text-muted-foreground">
            Official country name in English
          </p>
        </div>

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

import {
  profileProfilesCreateBody,
  profileProfilesUpdateBody,
} from "@/api/generated/shop/profile/profile.zod";
import type { Profile } from "@/api/generated/shop/schemas";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormLayout } from "@/components/common/FormLayout";
import { FormField } from "@/components/common/FormField";
import { FormSelect } from "@/components/common/FormSelect";
import { FormSubmitButton } from "@/components/common/FormSubmitButton";
import { isFieldRequired } from "@/utils/zod";

export type ProfileFormData = z.infer<typeof profileProfilesCreateBody>;
export type ProfileUpdateData = z.infer<typeof profileProfilesUpdateBody>;

interface ProfileFormProps {
  title: string;
  description: string;
  initialData?: Partial<Profile>;
  onSubmit: (data: ProfileFormData | ProfileUpdateData) => Promise<void>;
  submitButtonText: string;
  isSubmitting?: boolean;
  onCancel: () => void;
}

export function ProfileForm({
  title,
  description,
  initialData,
  onSubmit,
  submitButtonText,
  isSubmitting,
  onCancel,
}: ProfileFormProps) {
  const isUpdate = !!initialData?.id;
  const schema = profileProfilesUpdateBody;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialData,
  });

  const roleOptions = [
    { value: 1, label: "Admin" },
    { value: 2, label: "Employee" },
    { value: 3, label: "User" },
  ];

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data);
  });

  return (
    <FormLayout
      title={title}
      description={description}
      onCancel={onCancel}
      submitButtonText={submitButtonText}
      isSubmitting={isSubmitting}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="First Name"
          id="first_name"
          placeholder="Enter first name"
          register={form.register("first_name")}
          error={form.formState.errors.first_name}
          disabled={form.formState.isSubmitting}
          required={isFieldRequired(schema, "first_name")}
        />

        <FormField
          label="Last Name"
          id="last_name"
          placeholder="Enter last name"
          register={form.register("last_name")}
          error={form.formState.errors.last_name}
          disabled={form.formState.isSubmitting}
          required={isFieldRequired(schema, "last_name")}
        />

        <FormField
          label="Date of Birth"
          id="date_of_birth"
          type="date"
          register={form.register("date_of_birth", {
            setValueAs: (v) => (v && v !== "" ? v : null),
          })}
          error={form.formState.errors.date_of_birth}
          disabled={form.formState.isSubmitting}
          required={isFieldRequired(schema, "date_of_birth")}
        />

        <FormField
          label="Phone Number"
          id="phone_number"
          placeholder="Enter phone number with country code"
          register={form.register("phone_number")}
          error={form.formState.errors.phone_number}
          disabled={form.formState.isSubmitting}
          required={isFieldRequired(schema, "phone_number")}
        />
        <p className="text-xs text-muted-foreground">
          Include country code (e.g., +1234567890)
        </p>

        {initialData?.id && (
          <>
            <FormSelect
              label="Role"
              value={form.watch("role")}
              onValueChange={(value) => form.setValue("role", value as 1 | 2 | 3)}
              options={roleOptions}
              disabled={form.formState.isSubmitting}
              error={isUpdate ? form.formState.errors.role?.message : undefined}
              schema={isUpdate ? profileProfilesUpdateBody : undefined}
              fieldName="role"
              placeholder="Select a role"
            />
            <p className="text-xs text-muted-foreground">
              Change the user's access level
            </p>
          </>
        )}

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

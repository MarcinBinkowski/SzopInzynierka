import {
  catalogCategoriesCreateBody,
  catalogCategoriesUpdateBody,
} from "@/api/generated/shop/catalog/catalog.zod";
import type { Category } from "@/api/generated/shop/schemas";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormLayout } from "@/components/common/FormLayout";
import { FormField } from "@/components/common/FormField";
import { CheckboxField } from "@/components/common/CheckboxField";
import { SlugField } from "@/components/common/SlugField";
import { FormSubmitButton } from "@/components/common/FormSubmitButton";
import { isFieldRequired } from "@/utils/zod";

type CategoryCreateData = z.infer<typeof catalogCategoriesCreateBody>;
type CategoryUpdateData = z.infer<typeof catalogCategoriesUpdateBody>;
type CategoryFormData = CategoryCreateData | CategoryUpdateData;

interface CategoryFormProps {
  title: string;
  description: string;
  initialData?: Partial<Category>;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  submitButtonText: string;
  isSubmitting?: boolean;
  onCancel: () => void;
}

export function CategoryForm({
  title,
  description,
  initialData,
  onSubmit,
  submitButtonText,
  isSubmitting,
  onCancel,
}: CategoryFormProps) {
  const schema = initialData?.id
    ? catalogCategoriesUpdateBody
    : catalogCategoriesCreateBody;

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData,
  });

  const handleSubmit = form.handleSubmit(async (data: CategoryFormData) => {
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
        <FormField
          label="Name"
          id="name"
          placeholder="Enter category name"
          register={form.register("name")}
          error={form.formState.errors.name}
          disabled={form.formState.isSubmitting}
          required={isFieldRequired(schema, "name")}
        />

        <SlugField
          register={form.register("slug")}
          watch={form.watch}
          setValue={form.setValue}
          trigger={form.trigger}
          sourceField="name"
          error={form.formState.errors.slug}
          disabled={form.formState.isSubmitting}
        />

        <FormField
          label="Description"
          id="description"
          placeholder="Enter category description (optional)"
          register={form.register("description")}
          error={form.formState.errors.description}
          disabled={form.formState.isSubmitting}
          required={isFieldRequired(schema, "description")}
        />

        <CheckboxField
          id="is_active"
          label="Active"
          checked={form.watch("is_active") || false}
          onCheckedChange={(value) => form.setValue("is_active", value)}
          description="Is this category visible?"
          error={form.formState.errors.is_active}
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

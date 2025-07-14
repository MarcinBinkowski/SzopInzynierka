import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCatalogCategoriesCreate } from "@/api/generated/shop/catalog/catalog";
import { catalogCategoriesCreateBody } from "@/api/generated/shop/catalog/catalog.zod";
import { CategoryForm } from "@/components/categories/CategoryForm";
import { toast } from "sonner";
import { z } from "zod";

type CategoryFormData = z.infer<typeof catalogCategoriesCreateBody>;

function NewCategoryPage() {
  const navigate = useNavigate();
  const createMutation = useCatalogCategoriesCreate();

  const handleSubmit = async (formData: CategoryFormData) => {
    try {
      const validatedData = catalogCategoriesCreateBody.parse(formData);
      await createMutation.mutateAsync({ data: validatedData });
      toast.success("Category created successfully");
      navigate({ to: "/catalog/categories" });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to create category: ${error.message}`);
      } else {
        toast.error("Failed to create category");
      }
    }
  };

  const handleCancel = () => {
    navigate({ to: "/catalog/categories" });
  };

  return (
    <CategoryForm
      title="Create New Category"
      description="Add a new category to the catalog"
      onSubmit={handleSubmit}
      submitButtonText="Create Category"
      isSubmitting={createMutation.isPending}
      onCancel={handleCancel}
    />
  );
}

export const Route = createFileRoute("/_authenticated/catalog/categories/new")({
  component: NewCategoryPage,
});

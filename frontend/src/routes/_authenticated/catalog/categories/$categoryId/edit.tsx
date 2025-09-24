import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import {
  useCatalogCategoriesRetrieve,
  useCatalogCategoriesUpdate,
} from "@/api/generated/shop/catalog/catalog";
import { catalogCategoriesUpdateBody } from "@/api/generated/shop/catalog/catalog.zod";
import { CategoryForm } from "@/components/categories/CategoryForm";
import { Spinner } from "@/components/common/Spinner";
import { toast } from "sonner";
import { z } from "zod";

type CategoryFormData = z.infer<typeof catalogCategoriesUpdateBody>;

function EditCategoryPage() {
  const navigate = useNavigate();
  const { categoryId } = useParams({
    from: "/_authenticated/catalog/categories/$categoryId/edit",
  });
  const updateMutation = useCatalogCategoriesUpdate();

  const {
    data: category,
    isLoading,
    error,
  } = useCatalogCategoriesRetrieve(Number(categoryId));

  const handleSubmit = async (formData: CategoryFormData) => {
    try {
      const validatedData = catalogCategoriesUpdateBody.parse(formData);

      await updateMutation.mutateAsync({
        id: Number(categoryId),
        data: validatedData,
      });

      toast.success("Category updated successfully");
      navigate({ to: "/catalog/categories" });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to update category: ${error.message}`);
      } else {
        toast.error("Failed to update category");
      }
    }
  };

  const handleCancel = () => {
    navigate({ to: "/catalog/categories" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Spinner size="lg" />
          <span className="text-sm text-muted-foreground">
            Loading category...
          </span>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-600">Failed to load category</div>
      </div>
    );
  }

  return (
    <CategoryForm
      title="Edit Category"
      description="Update category information"
      initialData={category}
      onSubmit={handleSubmit}
      submitButtonText="Update Category"
      isSubmitting={updateMutation.isPending}
      onCancel={handleCancel}
    />
  );
}

export const Route = createFileRoute(
  "/_authenticated/catalog/categories/$categoryId/edit",
)({
  component: EditCategoryPage,
});

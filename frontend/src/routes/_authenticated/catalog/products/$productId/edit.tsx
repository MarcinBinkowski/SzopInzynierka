import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import {
  useCatalogProductsRetrieve,
  useCatalogProductsPartialUpdate,
} from "@/api/generated/shop/catalog/catalog";
import { catalogProductsPartialUpdateBody } from "@/api/generated/shop/catalog/catalog.zod";
import { ProductForm } from "@/components/products/ProductForm";
import { toast } from "sonner";
import { z } from "zod";
import { Spinner } from "@/components/common/Spinner";

type ProductFormData = z.infer<typeof catalogProductsPartialUpdateBody>;

function EditProductPage() {
  const navigate = useNavigate();
  const { productId } = useParams({
    from: "/_authenticated/catalog/products/$productId/edit",
  });
  const updateMutation = useCatalogProductsPartialUpdate();

  const {
    data: product,
    isLoading,
    error,
  } = useCatalogProductsRetrieve(parseInt(productId));

  const handleSubmit = async (formData: ProductFormData) => {
    try {
      const validatedData = catalogProductsPartialUpdateBody.parse(formData);

      await updateMutation.mutateAsync({
        id: parseInt(productId),
        data: validatedData,
      });

      toast.success("Product updated successfully");
      navigate({ to: "/catalog/products" });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to update product: ${error.message}`);
      } else {
        toast.error("Failed to update product");
      }
    }
  };

  const handleCancel = () => {
    navigate({ to: "/catalog/products" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-600">Failed to load product</div>
      </div>
    );
  }

  return (
    <ProductForm
      initialData={product}
      onSubmit={handleSubmit}
      submitButtonText="Update Product"
      isSubmitting={updateMutation.isPending}
      onCancel={handleCancel}
    />
  );
}

export const Route = createFileRoute(
  "/_authenticated/catalog/products/$productId/edit",
)({
  component: EditProductPage,
});

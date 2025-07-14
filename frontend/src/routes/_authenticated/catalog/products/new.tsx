import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCatalogProductsCreate } from "@/api/generated/shop/catalog/catalog";
import { catalogProductsCreateBody } from "@/api/generated/shop/catalog/catalog.zod";
import { ProductForm } from "@/components/products/ProductForm";
import { toast } from "sonner";
import { z } from "zod";

type ProductCreateData = z.infer<typeof catalogProductsCreateBody>;

function NewProductPage() {
  const navigate = useNavigate();
  const createMutation = useCatalogProductsCreate();

  const handleSubmit = async (formData: ProductCreateData) => {
    console.log("New product handleSubmit called with:", formData);
    try {
      console.log("Validating with Zod...");
      const validatedData = catalogProductsCreateBody.parse(formData);
      console.log("Validation successful, data:", validatedData);

      console.log("Calling API...");
      await createMutation.mutateAsync({ data: validatedData });

      console.log("API call successful");
      toast.success("Product created successfully");
      navigate({ to: "/catalog/products" });
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      if (error instanceof Error) {
        toast.error(`Failed to create product: ${error.message}`);
      } else {
        toast.error("Failed to create product");
      }
    }
  };

  const handleCancel = () => {
    navigate({ to: "/catalog/products" });
  };

  return (
    <ProductForm
      onSubmit={handleSubmit as any}
      submitButtonText="Create Product"
      isSubmitting={createMutation.isPending}
      onCancel={handleCancel}
    />
  );
}

export const Route = createFileRoute("/_authenticated/catalog/products/new")({
  component: NewProductPage,
});

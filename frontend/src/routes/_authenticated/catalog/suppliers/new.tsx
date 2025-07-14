import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  SupplierForm,
  type SupplierFormData,
} from "@/components/suppliers/SupplierForm";
import { useCatalogSuppliersCreate } from "@/api/generated/shop/catalog/catalog";

function NewSupplierPage() {
  const navigate = useNavigate();
  const createMutation = useCatalogSuppliersCreate();

  const handleSubmit = async (data: SupplierFormData) => {
    await createMutation.mutateAsync({ data });
    navigate({ to: "/catalog/suppliers" });
  };

  return (
    <SupplierForm
      title="New Supplier"
      description="Create a new supplier"
      onSubmit={handleSubmit}
      submitButtonText="Create"
      isSubmitting={createMutation.isPending}
      onCancel={() => navigate({ to: "/catalog/suppliers" })}
    />
  );
}

export const Route = createFileRoute("/_authenticated/catalog/suppliers/new")({
  component: NewSupplierPage,
});

import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import {
  useCatalogSuppliersRetrieve,
  useCatalogSuppliersUpdate,
} from "@/api/generated/shop/catalog/catalog";
import { catalogSuppliersUpdateBody } from "@/api/generated/shop/catalog/catalog.zod";
import { SupplierForm } from "@/components/suppliers/SupplierForm";
import { toast } from "sonner";
import { z } from "zod";
import { Spinner } from "@/components/common/Spinner";

type SupplierFormData = z.infer<typeof catalogSuppliersUpdateBody>;

function EditSupplierPage() {
  const navigate = useNavigate();
  const { supplierId } = useParams({
    from: "/_authenticated/catalog/suppliers/$supplierId/edit",
  });
  const updateMutation = useCatalogSuppliersUpdate();
  const {
    data: supplier,
    isLoading,
    error,
  } = useCatalogSuppliersRetrieve(parseInt(supplierId), {
    query: { enabled: !!supplierId },
  });

  const handleSubmit = async (formData: SupplierFormData) => {
    try {
      const validatedData = catalogSuppliersUpdateBody.parse(formData);
      await updateMutation.mutateAsync({
        id: parseInt(supplierId),
        data: validatedData,
      });
      toast.success("Supplier updated successfully");
      navigate({ to: "/catalog/suppliers" });
    } catch (error) {
      toast.error("Failed to update supplier");
    }
  };

  const handleCancel = () => navigate({ to: "/catalog/suppliers" });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Spinner size="lg" />
          <span className="text-sm text-muted-foreground">
            Loading supplier...
          </span>
        </div>
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-600">Failed to load supplier</div>
      </div>
    );
  }

  return (
    <SupplierForm
      title="Edit Supplier"
      description="Update supplier information"
      initialData={supplier}
      onSubmit={handleSubmit}
      submitButtonText="Update Supplier"
      isSubmitting={updateMutation.isPending}
      onCancel={handleCancel}
    />
  );
}

export const Route = createFileRoute(
  "/_authenticated/catalog/suppliers/$supplierId/edit",
)({
  component: EditSupplierPage,
});

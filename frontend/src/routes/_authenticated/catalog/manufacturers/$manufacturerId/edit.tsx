import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import {
  useCatalogManufacturersRetrieve,
  useCatalogManufacturersUpdate,
} from "@/api/generated/shop/catalog/catalog";
import { catalogManufacturersUpdateBody } from "@/api/generated/shop/catalog/catalog.zod";
import { ManufacturerForm } from "@/components/manufacturers/ManufacturerForm";
import { toast } from "sonner";
import { z } from "zod";
import { Spinner } from "@/components/common/Spinner";

type ManufacturerFormData = z.infer<typeof catalogManufacturersUpdateBody>;

function EditManufacturerPage() {
  const navigate = useNavigate();
  const { manufacturerId } = useParams({
    from: "/_authenticated/catalog/manufacturers/$manufacturerId/edit",
  });
  const updateMutation = useCatalogManufacturersUpdate();

  const {
    data: manufacturer,
    isLoading,
    error,
  } = useCatalogManufacturersRetrieve(parseInt(manufacturerId), {
    query: {
      enabled: !!manufacturerId,
    },
  });

  const handleSubmit = async (formData: ManufacturerFormData) => {
    try {
      const validatedData = catalogManufacturersUpdateBody.parse(formData);
      await updateMutation.mutateAsync({
        id: parseInt(manufacturerId),
        data: validatedData,
      });

      toast.success("Manufacturer updated successfully");
      navigate({ to: "/catalog/manufacturers" });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to update manufacturer: ${error.message}`);
      } else {
        toast.error("Failed to update manufacturer");
      }
    }
  };

  const handleCancel = () => {
    navigate({ to: "/catalog/manufacturers" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Spinner size="lg" />
          <span className="text-sm text-muted-foreground">
            Loading manufacturer...
          </span>
        </div>
      </div>
    );
  }

  if (error || !manufacturer) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-600">
          Failed to load manufacturer
        </div>
      </div>
    );
  }

  return (
    <ManufacturerForm
      title="Edit Manufacturer"
      description="Update manufacturer information"
      initialData={manufacturer}
      onSubmit={handleSubmit}
      submitButtonText="Update Manufacturer"
      isSubmitting={updateMutation.isPending}
      onCancel={handleCancel}
    />
  );
}

export const Route = createFileRoute(
  "/_authenticated/catalog/manufacturers/$manufacturerId/edit",
)({
  component: EditManufacturerPage,
});

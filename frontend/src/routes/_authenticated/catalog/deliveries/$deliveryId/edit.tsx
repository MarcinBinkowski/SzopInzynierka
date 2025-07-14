import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import {
  useCatalogDeliveriesRetrieve,
  useCatalogDeliveriesUpdate,
} from "@/api/generated/shop/catalog/catalog";
import { catalogDeliveriesUpdateBody } from "@/api/generated/shop/catalog/catalog.zod";
import { ProductDeliveryForm } from "@/components/deliveries/ProductDeliveryForm";
import { toast } from "sonner";
import { z } from "zod";
import { Spinner } from "@/components/common/Spinner";

type ProductDeliveryFormData = z.infer<typeof catalogDeliveriesUpdateBody>;

function EditDeliveryPage() {
  const navigate = useNavigate();
  const { deliveryId } = useParams({
    from: "/_authenticated/catalog/deliveries/$deliveryId/edit",
  });
  const updateMutation = useCatalogDeliveriesUpdate();
  const {
    data: delivery,
    isLoading,
    error,
  } = useCatalogDeliveriesRetrieve(parseInt(deliveryId), {
    query: { enabled: !!deliveryId },
  });

  const handleSubmit = async (formData: ProductDeliveryFormData) => {
    try {
      const validatedData = catalogDeliveriesUpdateBody.parse(formData);
      await updateMutation.mutateAsync({
        id: parseInt(deliveryId),
        data: validatedData,
      });
      toast.success("Delivery updated successfully");
      navigate({ to: "/catalog/deliveries" });
    } catch (error) {
      toast.error("Failed to update delivery");
    }
  };

  const handleCancel = () => navigate({ to: "/catalog/deliveries" });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Spinner size="lg" />
          <span className="text-sm text-muted-foreground">
            Loading delivery...
          </span>
        </div>
      </div>
    );
  }

  if (error || !delivery) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-600">Failed to load delivery</div>
      </div>
    );
  }

  return (
    <ProductDeliveryForm
      title="Edit Delivery"
      description="Update delivery information"
      initialData={delivery}
      onSubmit={handleSubmit}
      submitButtonText="Update Delivery"
      isSubmitting={updateMutation.isPending}
      onCancel={handleCancel}
    />
  );
}

export const Route = createFileRoute(
  "/_authenticated/catalog/deliveries/$deliveryId/edit",
)({
  component: EditDeliveryPage,
});

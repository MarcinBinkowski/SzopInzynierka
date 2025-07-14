import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ProductDeliveryForm,
  type ProductDeliveryFormData,
} from "@/components/deliveries/ProductDeliveryForm";
import { useCatalogDeliveriesCreate } from "@/api/generated/shop/catalog/catalog";

function NewDeliveryPage() {
  const navigate = useNavigate();
  const createMutation = useCatalogDeliveriesCreate();

  const handleSubmit = async (data: ProductDeliveryFormData) => {
    await createMutation.mutateAsync({ data });
    navigate({ to: "/catalog/deliveries" });
  };

  return (
    <ProductDeliveryForm
      title="New Delivery"
      description="Record a product delivery"
      onSubmit={handleSubmit}
      submitButtonText="Create"
      isSubmitting={createMutation.isPending}
      onCancel={() => navigate({ to: "/catalog/deliveries" })}
    />
  );
}

export const Route = createFileRoute("/_authenticated/catalog/deliveries/new")({
  component: NewDeliveryPage,
});

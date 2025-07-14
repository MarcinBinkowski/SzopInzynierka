import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ShippingMethodForm,
  type ShippingMethodFormData,
} from "@/components/shipping-methods/ShippingMethodForm";
import { useCheckoutShippingMethodsCreate } from "@/api/generated/shop/checkout/checkout";
import { toast } from "sonner";

export const Route = createFileRoute(
  "/_authenticated/checkout/shipping-methods/new",
)({
  component: NewShippingMethodPage,
});

function NewShippingMethodPage() {
  const navigate = useNavigate();
  const createMutation = useCheckoutShippingMethodsCreate();

  const handleSubmit = async (data: ShippingMethodFormData) => {
    try {
      await createMutation.mutateAsync({ data });
      toast.success("Shipping method created");
      navigate({ to: "/checkout/shipping-methods" });
    } catch (e) {
      toast.error("Failed to create shipping method");
      console.error(e);
    }
  };

  const handleCancel = () => navigate({ to: "/checkout/shipping-methods" });

  return (
    <ShippingMethodForm
      title="Create Shipping Method"
      description="Add a new shipping option"
      onSubmit={handleSubmit}
      submitButtonText="Create"
      isSubmitting={createMutation.isPending}
      onCancel={handleCancel}
    />
  );
}

import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import {
  ShippingMethodForm,
  type ShippingMethodFormData,
} from "@/components/shipping-methods/ShippingMethodForm";
import {
  useCheckoutShippingMethodsRetrieve,
  useCheckoutShippingMethodsUpdate,
} from "@/api/generated/shop/checkout/checkout";
import { toast } from "sonner";

export const Route = createFileRoute(
  "/_authenticated/checkout/shipping-methods/$methodId/edit",
)({
  component: EditShippingMethodPage,
});

function EditShippingMethodPage() {
  const navigate = useNavigate();
  const { methodId } = useParams({
    from: "/_authenticated/checkout/shipping-methods/$methodId/edit",
  });

  const { data, isLoading } = useCheckoutShippingMethodsRetrieve(
    Number(methodId),
  );
  const updateMutation = useCheckoutShippingMethodsUpdate();

  const handleSubmit = async (formData: ShippingMethodFormData) => {
    try {
      await updateMutation.mutateAsync({
        id: Number(methodId),
        data: formData as any,
      });
      toast.success("Shipping method updated");
      navigate({ to: "/checkout/shipping-methods" });
    } catch (e) {
      toast.error("Failed to update shipping method");
      console.error(e);
    }
  };

  const handleCancel = () => navigate({ to: "/checkout/shipping-methods" });

  if (isLoading || !data) return null;

  return (
    <ShippingMethodForm
      title="Edit Shipping Method"
      description="Update shipping option"
      initialData={data}
      onSubmit={handleSubmit}
      submitButtonText="Update"
      isSubmitting={updateMutation.isPending}
      onCancel={handleCancel}
    />
  );
}

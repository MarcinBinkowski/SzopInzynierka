import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  CourierForm,
  type CourierFormData,
} from "@/components/couriers/CourierForm";
import { useCheckoutCouriersCreate } from "@/api/generated/shop/checkout/checkout";

function NewCourierPage() {
  const navigate = useNavigate();
  const createMutation = useCheckoutCouriersCreate();

  const handleSubmit = async (data: CourierFormData) => {
    await createMutation.mutateAsync({ data });
    navigate({ to: "/checkout/couriers" });
  };

  return (
    <CourierForm
      title="New Courier"
      description="Create a new courier"
      onSubmit={handleSubmit}
      submitButtonText="Create"
      isSubmitting={createMutation.isPending}
      onCancel={() => navigate({ to: "/checkout/couriers" })}
    />
  );
}

export const Route = createFileRoute("/_authenticated/checkout/couriers/new")({
  component: NewCourierPage,
});

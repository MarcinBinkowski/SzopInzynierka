import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import {
  useCheckoutCouriersRetrieve,
  useCheckoutCouriersUpdate,
} from "@/api/generated/shop/checkout/checkout";
import { checkoutCouriersUpdateBody } from "@/api/generated/shop/checkout/checkout.zod";
import { CourierForm } from "@/components/couriers/CourierForm";
import { toast } from "sonner";
import { z } from "zod";
import { Spinner } from "@/components/common/Spinner";

type CourierFormData = z.infer<typeof checkoutCouriersUpdateBody>;

function EditCourierPage() {
  const navigate = useNavigate();
  const { courierId } = useParams({
    from: "/_authenticated/checkout/couriers/$courierId/edit",
  });
  const updateMutation = useCheckoutCouriersUpdate();
  const {
    data: courier,
    isLoading,
    error,
  } = useCheckoutCouriersRetrieve(parseInt(courierId), {
    query: { enabled: !!courierId },
  });

  const handleSubmit = async (formData: CourierFormData) => {
    try {
      const validatedData = checkoutCouriersUpdateBody.parse(formData);
      await updateMutation.mutateAsync({
        id: parseInt(courierId),
        data: validatedData,
      });
      toast.success("Courier updated successfully");
      navigate({ to: "/checkout/couriers" });
    } catch (error) {
      toast.error("Failed to update courier");
    }
  };

  const handleCancel = () => navigate({ to: "/checkout/couriers" });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Spinner size="lg" />
          <span className="text-sm text-muted-foreground">
            Loading courier...
          </span>
        </div>
      </div>
    );
  }

  if (error || !courier) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-600">Failed to load courier</div>
      </div>
    );
  }

  return (
    <CourierForm
      title="Edit Courier"
      description="Update courier information"
      initialData={courier}
      onSubmit={handleSubmit}
      submitButtonText="Update Courier"
      isSubmitting={updateMutation.isPending}
      onCancel={handleCancel}
    />
  );
}

export const Route = createFileRoute(
  "/_authenticated/checkout/couriers/$courierId/edit",
)({
  component: EditCourierPage,
});

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CouponForm } from "@/components/coupons/CouponForm";
import { useCheckoutCouponsCreate } from "@/api/generated/shop/checkout/checkout";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/checkout/coupons/new")({
  component: NewCouponPage,
});

function NewCouponPage() {
  const navigate = useNavigate();
  const createCoupon = useCheckoutCouponsCreate();

  const handleSubmit = async (data: any) => {
    try {
      await createCoupon.mutateAsync({ data });
      toast.success("Coupon created successfully");
      navigate({ to: "/checkout/coupons" });
    } catch (error) {
      toast.error("Failed to create coupon");
      console.error("Error creating coupon:", error);
    }
  };

  const handleCancel = () => {
    navigate({ to: "/checkout/coupons" });
  };

  return (
    <CouponForm
      title="Create Coupon"
      description="Add a new discount coupon to the system"
      onSubmit={handleSubmit}
      submitButtonText="Create Coupon"
      isSubmitting={createCoupon.isPending}
      onCancel={handleCancel}
    />
  );
}

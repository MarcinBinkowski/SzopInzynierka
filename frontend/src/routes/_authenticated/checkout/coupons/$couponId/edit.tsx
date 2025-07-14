import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { CouponForm } from "@/components/coupons/CouponForm";
import {
  useCheckoutCouponsRetrieve,
  useCheckoutCouponsUpdate,
} from "@/api/generated/shop/checkout/checkout";
import { toast } from "sonner";
import { Spinner } from "@/components/common/Spinner";

export const Route = createFileRoute(
  "/_authenticated/checkout/coupons/$couponId/edit",
)({
  component: EditCouponPage,
});

function EditCouponPage() {
  const navigate = useNavigate();
  const { couponId } = useParams({
    from: "/_authenticated/checkout/coupons/$couponId/edit",
  });

  const {
    data: coupon,
    isLoading,
    error,
  } = useCheckoutCouponsRetrieve(parseInt(couponId));
  const updateCoupon = useCheckoutCouponsUpdate();

  const handleSubmit = async (data: any) => {
    try {
      await updateCoupon.mutateAsync({
        id: parseInt(couponId),
        data,
      });
      toast.success("Coupon updated successfully");
      navigate({ to: "/checkout/coupons" });
    } catch (error) {
      toast.error("Failed to update coupon");
      console.error("Error updating coupon:", error);
    }
  };

  const handleCancel = () => {
    navigate({ to: "/checkout/coupons" });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !coupon) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-destructive">Failed to load coupon</p>
      </div>
    );
  }

  return (
    <CouponForm
      title="Edit Coupon"
      description="Update coupon details"
      initialData={coupon}
      onSubmit={handleSubmit}
      submitButtonText="Update Coupon"
      isSubmitting={updateCoupon.isPending}
      onCancel={handleCancel}
    />
  );
}

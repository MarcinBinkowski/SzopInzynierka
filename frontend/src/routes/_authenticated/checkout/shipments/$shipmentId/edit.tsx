import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ShipmentForm,
  type ShipmentUpdateData,
} from "@/components/shipments/ShipmentForm";
import {
  useCheckoutShipmentsRetrieve,
  useCheckoutShipmentsUpdate,
} from "@/api/generated/shop/checkout/checkout";
import { toast } from "sonner";
import { Spinner } from "@/components/common/Spinner";

function EditShipmentPage() {
  const navigate = useNavigate();
  const { shipmentId } = Route.useParams();

  const { data: shipment, isLoading } = useCheckoutShipmentsRetrieve(
    parseInt(shipmentId),
  );

  const updateMutation = useCheckoutShipmentsUpdate({
    mutation: {
      onSuccess: () => {
        toast.success("Shipment updated successfully");
        navigate({ to: "/checkout/shipments" });
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "Failed to update shipment",
        );
      },
    },
  });

  const handleSubmit = async (data: ShipmentUpdateData) => {
    await updateMutation.mutateAsync({
      id: parseInt(shipmentId),
      data,
    });
  };

  const handleCancel = () => {
    navigate({ to: "/checkout/shipments" });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Shipment not found</p>
      </div>
    );
  }

  return (
    <ShipmentForm
      title="Edit Shipment"
      description={`Edit shipment #${shipment.id}`}
      initialData={shipment}
      onSubmit={handleSubmit}
      submitButtonText="Update Shipment"
      isSubmitting={updateMutation.isPending}
      onCancel={handleCancel}
    />
  );
}

export const Route = createFileRoute(
  "/_authenticated/checkout/shipments/$shipmentId/edit",
)({
  component: EditShipmentPage,
});

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  OrderProcessingNoteForm,
  type OrderNoteFormData,
} from "@/components/order-notes/OrderProcessingNoteForm";
import { useCheckoutOrderNotesCreate } from "@/api/generated/shop/checkout/checkout";

function NewOrderNotePage() {
  const navigate = useNavigate();
  const createMutation = useCheckoutOrderNotesCreate();

  const handleSubmit = async (data: OrderNoteFormData) => {
    await createMutation.mutateAsync({ data });
    navigate({ to: "/checkout/order-notes" });
  };

  return (
    <OrderProcessingNoteForm
      title="New Order Note"
      description="Create a new processing note"
      onSubmit={handleSubmit}
      submitButtonText="Create"
      isSubmitting={createMutation.isPending}
      onCancel={() => navigate({ to: "/checkout/order-notes" })}
    />
  );
}

export const Route = createFileRoute(
  "/_authenticated/checkout/order-notes/new",
)({
  component: NewOrderNotePage,
});

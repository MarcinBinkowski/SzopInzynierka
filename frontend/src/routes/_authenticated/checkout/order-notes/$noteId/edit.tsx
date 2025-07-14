import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import {
  useCheckoutOrderNotesRetrieve,
  useCheckoutOrderNotesUpdate,
} from "@/api/generated/shop/checkout/checkout";
import { checkoutOrderNotesUpdateBody } from "@/api/generated/shop/checkout/checkout.zod";
import { OrderProcessingNoteForm } from "@/components/order-notes/OrderProcessingNoteForm";
import { toast } from "sonner";
import { z } from "zod";
import { Spinner } from "@/components/common/Spinner";

type OrderNoteFormData = z.infer<typeof checkoutOrderNotesUpdateBody>;

function EditOrderNotePage() {
  const navigate = useNavigate();
  const { noteId } = useParams({
    from: "/_authenticated/checkout/order-notes/$noteId/edit",
  });
  const updateMutation = useCheckoutOrderNotesUpdate();
  const {
    data: note,
    isLoading,
    error,
  } = useCheckoutOrderNotesRetrieve(parseInt(noteId), {
    query: { enabled: !!noteId },
  });

  const handleSubmit = async (formData: OrderNoteFormData) => {
    try {
      const validatedData = checkoutOrderNotesUpdateBody.parse(formData);
      await updateMutation.mutateAsync({
        id: parseInt(noteId),
        data: validatedData,
      });
      toast.success("Note updated successfully");
      navigate({ to: "/checkout/order-notes" });
    } catch (error) {
      toast.error("Failed to update note");
    }
  };

  const handleCancel = () => navigate({ to: "/checkout/order-notes" });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Spinner size="lg" />
          <span className="text-sm text-muted-foreground">Loading note...</span>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-600">Failed to load note</div>
      </div>
    );
  }

  return (
    <OrderProcessingNoteForm
      title="Edit Order Note"
      description="Update processing note"
      initialData={note}
      onSubmit={handleSubmit}
      submitButtonText="Update Note"
      isSubmitting={updateMutation.isPending}
      onCancel={handleCancel}
    />
  );
}

export const Route = createFileRoute(
  "/_authenticated/checkout/order-notes/$noteId/edit",
)({
  component: EditOrderNotePage,
});

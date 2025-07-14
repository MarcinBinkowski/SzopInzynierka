import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCheckoutInvoiceTemplatesCreate } from "@/api/generated/shop/checkout/checkout";
import { checkoutInvoiceTemplatesCreateBody } from "@/api/generated/shop/checkout/checkout.zod";
import { InvoiceTemplateForm } from "@/components/invoice-templates/InvoiceTemplateForm";
import { toast } from "sonner";
import { z } from "zod";

type InvoiceTemplateFormData = z.infer<
  typeof checkoutInvoiceTemplatesCreateBody
>;

function NewInvoiceTemplatePage() {
  const navigate = useNavigate();
  const createMutation = useCheckoutInvoiceTemplatesCreate();

  const handleSubmit = async (formData: InvoiceTemplateFormData) => {
    try {
      const validatedData = checkoutInvoiceTemplatesCreateBody.parse(formData);

      await createMutation.mutateAsync({ data: validatedData });

      toast.success("Invoice template created successfully");
      navigate({ to: "/invoice-templates" });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to create template: ${error.message}`);
      } else {
        toast.error("Failed to create template");
      }
    }
  };

  const handleCancel = () => {
    navigate({ to: "/invoice-templates" });
  };

  return (
    <InvoiceTemplateForm
      title="Create New Invoice Template"
      description="Add a new template for invoice generation"
      onSubmit={handleSubmit}
      submitButtonText="Create Template"
      isSubmitting={createMutation.isPending}
      onCancel={handleCancel}
    />
  );
}

export const Route = createFileRoute("/_authenticated/invoice-templates/new")({
  component: NewInvoiceTemplatePage,
});

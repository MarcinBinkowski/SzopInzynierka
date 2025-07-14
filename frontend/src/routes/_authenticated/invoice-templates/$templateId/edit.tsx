import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import {
  useCheckoutInvoiceTemplatesRetrieve,
  useCheckoutInvoiceTemplatesUpdate,
} from "@/api/generated/shop/checkout/checkout";
import { checkoutInvoiceTemplatesUpdateBody } from "@/api/generated/shop/checkout/checkout.zod";
import { InvoiceTemplateForm } from "@/components/invoice-templates/InvoiceTemplateForm";
import { Spinner } from "@/components/common/Spinner";
import { toast } from "sonner";
import { z } from "zod";

type InvoiceTemplateFormData = z.infer<
  typeof checkoutInvoiceTemplatesUpdateBody
>;

function EditInvoiceTemplatePage() {
  const navigate = useNavigate();
  const { templateId } = useParams({
    from: "/_authenticated/invoice-templates/$templateId/edit",
  });
  const updateMutation = useCheckoutInvoiceTemplatesUpdate();

  const {
    data: template,
    isLoading,
    error,
  } = useCheckoutInvoiceTemplatesRetrieve(Number(templateId));

  const handleSubmit = async (formData: InvoiceTemplateFormData) => {
    try {
      const validatedData = checkoutInvoiceTemplatesUpdateBody.parse(formData);

      await updateMutation.mutateAsync({
        id: Number(templateId),
        data: validatedData,
      });

      toast.success("Invoice template updated successfully");
      navigate({ to: "/invoice-templates" });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to update template: ${error.message}`);
      } else {
        toast.error("Failed to update template");
      }
    }
  };

  const handleCancel = () => {
    navigate({ to: "/invoice-templates" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Spinner size="lg" />
          <span className="text-sm text-muted-foreground">
            Loading template...
          </span>
        </div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-600">Failed to load template</div>
      </div>
    );
  }

  return (
    <InvoiceTemplateForm
      title="Edit Invoice Template"
      description="Update template information and content"
      initialData={template}
      onSubmit={handleSubmit}
      submitButtonText="Update Template"
      isSubmitting={updateMutation.isPending}
      onCancel={handleCancel}
    />
  );
}

export const Route = createFileRoute(
  "/_authenticated/invoice-templates/$templateId/edit",
)({
  component: EditInvoiceTemplatePage,
});

import { useCheckoutInvoiceTemplatesVariablesRetrieve } from "@/api/generated/shop/checkout/checkout";
import { Controller } from "react-hook-form";
import HtmlTemplateEditor from "@/components/invoice-templates/HtmlTemplateEditor";

type TemplateVariablesResponse = {
  variables: Record<string, string[]>;
};
import {
  checkoutInvoiceTemplatesCreateBody,
  checkoutInvoiceTemplatesUpdateBody,
} from "@/api/generated/shop/checkout/checkout.zod";
import type { InvoiceTemplate } from "@/api/generated/shop/schemas/invoiceTemplate";
import { FormLayout } from "@/components/common/FormLayout";
import { FormField } from "@/components/common/FormField";
import { FormSubmitButton } from "@/components/common/FormSubmitButton";
import { isFieldRequired } from "@/utils/zod";
import { Spinner } from "@/components/common/Spinner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

type InvoiceTemplateCreateData = z.infer<
  typeof checkoutInvoiceTemplatesCreateBody
>;
type InvoiceTemplateUpdateData = z.infer<
  typeof checkoutInvoiceTemplatesUpdateBody
>;
type InvoiceTemplateFormData =
  | InvoiceTemplateCreateData
  | InvoiceTemplateUpdateData;

interface InvoiceTemplateFormProps {
  title: string;
  description: string;
  initialData?: Partial<InvoiceTemplate>;
  onSubmit: (data: InvoiceTemplateFormData) => Promise<void>;
  submitButtonText: string;
  isSubmitting?: boolean;
  onCancel: () => void;
}

export function InvoiceTemplateForm({
  title,
  description,
  initialData,
  onSubmit,
  submitButtonText,
  isSubmitting,
  onCancel,
}: InvoiceTemplateFormProps) {
  const schema = initialData?.id
    ? checkoutInvoiceTemplatesUpdateBody
    : checkoutInvoiceTemplatesCreateBody;

  const form = useForm<InvoiceTemplateFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...initialData,
      is_default: initialData?.is_default || false,
    },
  });

  const handleSubmit = form.handleSubmit(
    async (data: InvoiceTemplateFormData) => {
      await onSubmit(data);
    },
  );

  const { data: variablesData, isLoading: isLoadingVariables } =
    useCheckoutInvoiceTemplatesVariablesRetrieve();

  return (
    <FormLayout
      title={title}
      description={description}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Template Name"
          id="name"
          placeholder="Enter template name (e.g., Standard Invoice)"
          register={form.register("name")}
          error={form.formState.errors.name}
          disabled={form.formState.isSubmitting}
          required={isFieldRequired(schema, "name")}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium">Template Content</label>
          {isLoadingVariables ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner size="sm" /> Loading editor…
            </div>
          ) : (
            <Controller
              name="content"
              control={form.control}
              rules={{ required: isFieldRequired(schema, "content") }}
              render={({ field }) => (
                <HtmlTemplateEditor
                  value={field.value || ""}
                  onChange={field.onChange}
                />
              )}
            />
          )}
          {form.formState.errors.content && (
            <p className="text-sm text-red-600">{form.formState.errors.content.message as string}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_default"
              {...form.register("is_default")}
              disabled={form.formState.isSubmitting}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_default" className="text-sm font-medium text-gray-700">
              Set as default template for automatic invoice generation
            </label>
          </div>
        </div>
        {form.formState.errors.is_default && (
          <p className="text-sm text-red-600">
            {form.formState.errors.is_default.message}
          </p>
        )}

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">Available Variables</h4>
          <p className="text-sm text-muted-foreground mb-3">
            You can use these variables in your template:
          </p>
          {isLoadingVariables ? (
            <div className="flex items-center justify-center py-4">
              <Spinner size="sm" />
              <span className="ml-2 text-sm text-muted-foreground">
                Loading variables...
              </span>
            </div>
          ) : (variablesData as unknown as TemplateVariablesResponse)
              ?.variables ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {Object.entries(
                (variablesData as unknown as TemplateVariablesResponse)
                  .variables,
              ).map(([modelName, properties]) => (
                <div key={modelName}>
                  <h5 className="font-medium capitalize">
                    {modelName.replace("_", " ")}
                  </h5>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {properties.map((property, index) => (
                      <li key={index} className="font-mono text-xs">
                        &#123;&#123; {modelName}.{property} &#125;&#125;
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              <p>
                Unable to load available variables. Please check your
                connection.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <FormSubmitButton
            isSubmitting={isSubmitting}
            submitButtonText={submitButtonText}
          />
        </div>
      </form>
    </FormLayout>
  );
}

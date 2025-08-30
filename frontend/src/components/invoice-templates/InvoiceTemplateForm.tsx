"use client"

import { useCheckoutInvoiceTemplatesVariablesRetrieve } from "@/api/generated/shop/checkout/checkout"
import { 
  checkoutInvoiceTemplatesCreateBody, 
  checkoutInvoiceTemplatesUpdateBody
} from "@/api/generated/shop/checkout/checkout.zod"
import type { InvoiceTemplate } from '@/api/generated/shop/schemas/invoiceTemplate'
import { Spinner } from "@/components/customui/Spinner"
import { FormLayout } from "@/components/common/FormLayout"
import { FormField } from "@/components/customui/FormField"
import { isFieldRequired } from "@/utils/zod"

import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

type InvoiceTemplateCreateData = z.infer<typeof checkoutInvoiceTemplatesCreateBody>
type InvoiceTemplateUpdateData = z.infer<typeof checkoutInvoiceTemplatesUpdateBody>
type InvoiceTemplateFormData = InvoiceTemplateCreateData | InvoiceTemplateUpdateData

interface InvoiceTemplateFormProps {
  title: string
  description: string
  initialData?: Partial<InvoiceTemplate>
  onSubmit: (data: InvoiceTemplateFormData) => Promise<void>
  submitButtonText: string
  isSubmitting?: boolean
  onCancel: () => void
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
  const schema = initialData?.id ? checkoutInvoiceTemplatesUpdateBody : checkoutInvoiceTemplatesCreateBody
  
  const form = useForm<InvoiceTemplateFormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData,
  })

  const handleSubmit = form.handleSubmit(async (data: InvoiceTemplateFormData) => {
    await onSubmit(data)
  })
  
  const { data: variablesData, isLoading: isLoadingVariables } = useCheckoutInvoiceTemplatesVariablesRetrieve()

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
          register={form.register('name')}
          error={form.formState.errors.name}
          disabled={form.formState.isSubmitting}
          required={isFieldRequired(schema, 'name')}
        />

        <FormField
          label="Template Content (Jinja2)"
          id="content"
          placeholder="Enter Jinja2 template content with HTML..."
          register={form.register('content')}
          error={form.formState.errors.content}
          disabled={form.formState.isSubmitting}
          multiline
          rows={20}
          required={isFieldRequired(schema, 'content')}
        />

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">Available Variables</h4>
          <p className="text-sm text-muted-foreground mb-3">
            You can use these variables in your template:
          </p>
          {isLoadingVariables ? (
            <div className="flex items-center justify-center py-4">
              <Spinner size="sm" />
              <span className="ml-2 text-sm text-muted-foreground">Loading variables...</span>
            </div>
          ) : variablesData?.variables ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {Object.entries(variablesData.variables).map(([modelName, properties]) => (
                <div key={modelName}>
                  <h5 className="font-medium capitalize">{modelName.replace('_', ' ')}</h5>
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
              <p>Unable to load available variables. Please check your connection.</p>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                {submitButtonText}
              </>
            ) : (
              submitButtonText
            )}
          </Button>
        </div>
      </form>
    </FormLayout>
  )
} 
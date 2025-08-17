"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { useCheckoutInvoiceTemplatesVariablesRetrieve } from "@/api/generated/shop/checkout/checkout"
import { Spinner } from "@/components/customui/spinner"

// Schema for form validation
const invoiceTemplateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  content: z.string().min(1, "Content is required"),
})

type InvoiceTemplateFormData = z.infer<typeof invoiceTemplateSchema>

interface InvoiceTemplateFormProps {
  title: string
  description: string
  initialData?: Partial<InvoiceTemplateFormData>
  onSubmit: (data: InvoiceTemplateFormData) => Promise<void>
  submitButtonText: string
  isSubmitting: boolean
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
  const form = useForm<InvoiceTemplateFormData>({
    resolver: zodResolver(invoiceTemplateSchema),
    defaultValues: {
      name: initialData?.name || "",
      content: initialData?.content || "",
    },
  })

  // Fetch available variables from API
  const { data: variablesData, isLoading: isLoadingVariables } = useCheckoutInvoiceTemplatesVariablesRetrieve()

  const handleSubmit = async (data: InvoiceTemplateFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error("Form submission error:", error)
    }
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter template name (e.g., Standard Invoice)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Content (Jinja2)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter Jinja2 template content with HTML..."
                        className="min-h-[400px] font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
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

              <Separator />

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : submitButtonText}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
} 
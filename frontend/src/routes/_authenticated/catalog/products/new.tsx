"use client"

import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useCatalogProductsCreate } from "@/api/generated/shop/catalog/catalog"
import { catalogProductsCreateBody } from "@/api/generated/shop/catalog/catalog.zod"
import { ProductForm } from "@/components/products/ProductForm"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { z } from "zod"

// Use the generated Zod schema types
type ProductFormData = z.infer<typeof catalogProductsCreateBody>

function NewProductPage() {
  const navigate = useNavigate()
  const createMutation = useCatalogProductsCreate()
  const queryClient = useQueryClient()

  const handleSubmit = async (formData: ProductFormData) => {
    try {
      // Validate the form data using Zod schema
      const validatedData = catalogProductsCreateBody.parse(formData)
      
      await createMutation.mutateAsync({ data: validatedData })
      
      queryClient.invalidateQueries({ queryKey: ["/api/catalog/products/"] })
      
      toast.success("Product created successfully")
      navigate({ to: "/catalog/products" })
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to create product: ${error.message}`)
      } else {
        toast.error("Failed to create product")
      }
    }
  }

  const handleCancel = () => {
    navigate({ to: "/catalog/products" })
  }

  return (
    <ProductForm
      onSubmit={handleSubmit}
      submitButtonText="Create Product"
      isSubmitting={createMutation.isPending}
      onCancel={handleCancel}
    />
  )
}

export const Route = createFileRoute('/_authenticated/catalog/products/new')({
  component: NewProductPage,
})

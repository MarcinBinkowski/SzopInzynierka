"use client"

import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router"
import { useCatalogProductsRetrieve, useCatalogProductsPartialUpdate } from "@/api/generated/shop/catalog/catalog"
import { catalogProductsPartialUpdateBody } from "@/api/generated/shop/catalog/catalog.zod"
import { ProductForm } from "@/components/products/ProductForm"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { z } from "zod"
import { Spinner } from "@/components/customui/spinner"

// Use the generated Zod schema types
type ProductFormData = z.infer<typeof catalogProductsPartialUpdateBody>

function EditProductPage() {
  const navigate = useNavigate()
  const { productId } = useParams({ from: "/_authenticated/catalog/products/$productId/edit" })
  const updateMutation = useCatalogProductsPartialUpdate()
  const queryClient = useQueryClient()

  // Fetch product data
  const { data: product, isLoading, error } = useCatalogProductsRetrieve(parseInt(productId))

  const handleSubmit = async (formData: ProductFormData) => {
    try {
      // Validate the form data using Zod schema
      const validatedData = catalogProductsPartialUpdateBody.parse(formData)
      
      await updateMutation.mutateAsync({ 
        id: parseInt(productId), 
        data: validatedData 
      })
      
      queryClient.invalidateQueries({ queryKey: ["/api/catalog/products/"] })
      queryClient.invalidateQueries({ queryKey: [`/api/catalog/products/${productId}/`] })
      
      toast.success("Product updated successfully")
      navigate({ to: "/catalog/products" })
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to update product: ${error.message}`)
      } else {
        toast.error("Failed to update product")
      }
    }
  }

  const handleCancel = () => {
    navigate({ to: "/catalog/products" })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Product not found</h2>
          <p className="text-gray-600 mt-2">The product you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate({ to: "/catalog/products" })}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Products
          </button>
        </div>
      </div>
    )
  }

  return (
    <ProductForm
      initialData={product}
      onSubmit={handleSubmit}
      submitButtonText="Update Product"
      isSubmitting={updateMutation.isPending}
      onCancel={handleCancel}

    />
  )
}

export const Route = createFileRoute("/_authenticated/catalog/products/$productId/edit")({
  component: EditProductPage,
})

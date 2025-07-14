"use client"

import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useCatalogCategoriesCreate } from "@/api/generated/shop/catalog/catalog"
import { catalogCategoriesCreateBody } from "@/api/generated/shop/catalog/catalog.zod"
import { CategoryForm } from "@/components/categories/CategoryForm"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { z } from "zod"

// Use the generated Zod schema types
type CategoryFormData = z.infer<typeof catalogCategoriesCreateBody>

function NewCategoryPage() {
  const navigate = useNavigate()
  const createMutation = useCatalogCategoriesCreate()
  const queryClient = useQueryClient()

  const handleSubmit = async (formData: CategoryFormData) => {
    try {
      // Validate the form data using Zod schema
      const validatedData = catalogCategoriesCreateBody.parse(formData)
      
      await createMutation.mutateAsync({ data: validatedData })
      
      queryClient.invalidateQueries({ queryKey: ["/api/catalog/categories/"] })
      
      toast.success("Category created successfully")
      navigate({ to: "/catalog/categories" })
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to create category: ${error.message}`)
      } else {
        toast.error("Failed to create category")
      }
    }
  }

  const handleCancel = () => {
    navigate({ to: "/catalog/categories" })
  }

  return (
    <CategoryForm
      title="Create New Category"
      description="Add a new category to your catalog"
      onSubmit={handleSubmit}
      submitButtonText="Create Category"
      isSubmitting={createMutation.isPending}
      onCancel={handleCancel}
    />
  )
}

export const Route = createFileRoute('/_authenticated/catalog/categories/new')({
  component: NewCategoryPage,
}) 
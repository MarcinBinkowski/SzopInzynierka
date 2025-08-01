"use client"

import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useCatalogManufacturersCreate } from "@/api/generated/shop/catalog/catalog"
import { catalogManufacturersCreateBody } from "@/api/generated/shop/catalog/catalog.zod"
import { ManufacturerForm } from "@/components/manufacturers/ManufacturerForm"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { z } from "zod"

// Use the generated Zod schema types
type ManufacturerFormData = z.infer<typeof catalogManufacturersCreateBody>

function NewManufacturerPage() {
  const navigate = useNavigate()
  const createMutation = useCatalogManufacturersCreate()
  const queryClient = useQueryClient()

  const handleSubmit = async (formData: ManufacturerFormData) => {
    try {
      // Validate the form data using Zod schema
      const validatedData = catalogManufacturersCreateBody.parse(formData)
      
      await createMutation.mutateAsync({ data: validatedData })
      
      queryClient.invalidateQueries({ queryKey: ["/api/catalog/manufacturers/"] })
      
      toast.success("Manufacturer created successfully")
      navigate({ to: "/catalog/manufacturers" })
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to create manufacturer: ${error.message}`)
      } else {
        toast.error("Failed to create manufacturer")
      }
    }
  }

  const handleCancel = () => {
    navigate({ to: "/catalog/manufacturers" })
  }

  return (
    <ManufacturerForm
      title="Create New Manufacturer"
      description="Add a new manufacturer to the system"
      onSubmit={handleSubmit}
      submitButtonText="Create Manufacturer"
      isSubmitting={createMutation.isPending}
      onCancel={handleCancel}
    />
  )
}

export const Route = createFileRoute('/_authenticated/catalog/manufacturers/new')({
  component: NewManufacturerPage,
}) 
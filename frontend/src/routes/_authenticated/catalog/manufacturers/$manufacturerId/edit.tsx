"use client"

import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router"
import { useCatalogManufacturersRetrieve, useCatalogManufacturersUpdate } from "@/api/generated/shop/catalog/catalog"
import { catalogManufacturersUpdateBody } from "@/api/generated/shop/catalog/catalog.zod"
import { ManufacturerForm } from "@/components/manufacturers/ManufacturerForm"
import { toast } from "sonner"
import { z } from "zod"
import { Spinner } from "@/components/customui/spinner"
import { Button } from "@/components/ui/button"

// Use the generated Zod schema types
type ManufacturerFormData = z.infer<typeof catalogManufacturersUpdateBody>

function EditManufacturerPage() {
  const navigate = useNavigate()
  const { manufacturerId } = useParams({ from: '/_authenticated/catalog/manufacturers/$manufacturerId/edit' })
  const updateMutation = useCatalogManufacturersUpdate()


  const { data: manufacturer, isLoading, error } = useCatalogManufacturersRetrieve(
    parseInt(manufacturerId),
    {
      query: {
        enabled: !!manufacturerId,
      },
    }
  )

  const handleSubmit = async (formData: ManufacturerFormData) => {
    try {
      // Validate the form data using Zod schema
      const validatedData = catalogManufacturersUpdateBody.parse(formData)
      
      await updateMutation.mutateAsync({ 
        id: parseInt(manufacturerId), 
        data: validatedData 
      })
      
      toast.success("Manufacturer updated successfully")
      navigate({ to: "/catalog/manufacturers" })
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to update manufacturer: ${error.message}`)
      } else {
        toast.error("Failed to update manufacturer")
      }
    }
  }

  const handleCancel = () => {
    navigate({ to: "/catalog/manufacturers" })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Error Loading Manufacturer</h2>
          <p className="text-muted-foreground mt-2">
            {error instanceof Error ? error.message : "An unexpected error occurred"}
          </p>
          <Button
            variant="outline"
            onClick={() => navigate({ to: "/catalog/manufacturers" })}
            className="mt-4"
          >
            Back to Manufacturers
          </Button>
        </div>
      </div>
    )
  }

  if (!manufacturer) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Manufacturer Not Found</h2>
          <p className="text-muted-foreground mt-2">
            The manufacturer you're looking for doesn't exist.
          </p>
          <Button
            variant="outline"
            onClick={() => navigate({ to: "/catalog/manufacturers" })}
            className="mt-4"
          >
            Back to Manufacturers
          </Button>
        </div>
      </div>
    )
  }

  return (
    <ManufacturerForm
      title="Edit Manufacturer"
      description="Update manufacturer information"
      initialData={manufacturer}
      onSubmit={handleSubmit}
      submitButtonText="Update Manufacturer"
      isSubmitting={updateMutation.isPending}
      onCancel={handleCancel}
    />
  )
}

export const Route = createFileRoute('/_authenticated/catalog/manufacturers/$manufacturerId/edit')({
  component: EditManufacturerPage,
}) 
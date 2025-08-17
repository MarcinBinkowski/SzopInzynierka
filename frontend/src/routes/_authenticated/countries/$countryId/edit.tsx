"use client"

import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router"
import { useGeographicCountriesRetrieve, useGeographicCountriesUpdate } from "@/api/generated/shop/geographic/geographic"
import { geographicCountriesUpdateBody } from "@/api/generated/shop/geographic/geographic.zod"
import { CountryForm } from "@/components/countries/CountryForm"
import { toast } from "sonner"
import { z } from "zod"
import { Spinner } from "@/components/customui/spinner"
import { Button } from "@/components/ui/button"

// Use the generated Zod schema types
type CountryFormData = z.infer<typeof geographicCountriesUpdateBody>

function EditCountryPage() {
  const navigate = useNavigate()
  const { countryId } = useParams({ from: '/_authenticated/countries/$countryId/edit' })
  const updateMutation = useGeographicCountriesUpdate()

  const { data: country, isLoading, error } = useGeographicCountriesRetrieve(
    parseInt(countryId),
    {
      query: {
        enabled: !!countryId,
      },
    }
  )

  const handleSubmit = async (formData: CountryFormData) => {
    try {
      // Validate the form data using Zod schema
      const validatedData = geographicCountriesUpdateBody.parse(formData)
      
      await updateMutation.mutateAsync({ 
        id: parseInt(countryId), 
        data: validatedData 
      })
      
      toast.success("Country updated successfully")
      navigate({ to: "/countries" })
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to update country: ${error.message}`)
      } else {
        toast.error("Failed to update country")
      }
    }
  }

  const handleCancel = () => {
    navigate({ to: "/countries" })
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
          <h2 className="text-xl font-semibold text-red-600">Error Loading Country</h2>
          <p className="text-muted-foreground mt-2">
            {error instanceof Error ? error.message : "An unexpected error occurred"}
          </p>
          <Button
            variant="outline"
            onClick={() => navigate({ to: "/countries" })}
            className="mt-4"
          >
            Back to Countries
          </Button>
        </div>
      </div>
    )
  }

  if (!country) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Country Not Found</h2>
          <p className="text-muted-foreground mt-2">
            The country you're looking for doesn't exist.
          </p>
          <Button
            variant="outline"
            onClick={() => navigate({ to: "/countries" })}
            className="mt-4"
          >
            Back to Countries
          </Button>
        </div>
      </div>
    )
  }

  return (
    <CountryForm
      title="Edit Country"
      description="Update country information"
      initialData={country}
      onSubmit={handleSubmit}
      submitButtonText="Update Country"
      isSubmitting={updateMutation.isPending}
      onCancel={handleCancel}
    />
  )
}

export const Route = createFileRoute('/_authenticated/countries/$countryId/edit')({
  component: EditCountryPage,
}) 
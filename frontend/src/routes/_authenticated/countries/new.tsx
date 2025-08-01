"use client"

import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useGeographicCountriesCreate } from "@/api/generated/shop/geographic/geographic"
import { geographicCountriesCreateBody } from "@/api/generated/shop/geographic/geographic.zod"
import { CountryForm } from "@/components/countries/CountryForm"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { z } from "zod"

// Use the generated Zod schema types
type CountryFormData = z.infer<typeof geographicCountriesCreateBody>

function NewCountryPage() {
  const navigate = useNavigate()
  const createMutation = useGeographicCountriesCreate()
  const queryClient = useQueryClient()

  const handleSubmit = async (formData: CountryFormData) => {
    try {
      // Validate the form data using Zod schema
      const validatedData = geographicCountriesCreateBody.parse(formData)
      
      await createMutation.mutateAsync({ data: validatedData })
      
      queryClient.invalidateQueries({ queryKey: ["/api/geographic/countries/"] })
      
      toast.success("Country created successfully")
      navigate({ to: "/countries" })
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to create country: ${error.message}`)
      } else {
        toast.error("Failed to create country")
      }
    }
  }

  const handleCancel = () => {
    navigate({ to: "/countries" })
  }

  return (
    <CountryForm
      title="Create New Country"
      description="Add a new country to the system"
      onSubmit={handleSubmit}
      submitButtonText="Create Country"
      isSubmitting={createMutation.isPending}
      onCancel={handleCancel}
    />
  )
}

export const Route = createFileRoute('/_authenticated/countries/new')({
  component: NewCountryPage,
}) 
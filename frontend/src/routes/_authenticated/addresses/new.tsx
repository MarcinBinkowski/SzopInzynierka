"use client"

import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useProfileAddressesCreate } from "@/api/generated/shop/profile/profile"
import { profileAddressesCreateBody, profileAddressesUpdateBody } from "@/api/generated/shop/profile/profile.zod"
import { AddressForm } from "@/components/addresses/AddressForm"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { z } from "zod"

// Use the generated Zod schema types
type AddressCreateData = z.infer<typeof profileAddressesCreateBody>
type AddressUpdateData = z.infer<typeof profileAddressesUpdateBody>
type AddressFormData = AddressCreateData | AddressUpdateData

function NewAddressPage() {
  const navigate = useNavigate()
  const createMutation = useProfileAddressesCreate()
  const queryClient = useQueryClient()

  const handleSubmit = async (formData: AddressFormData) => {
    try {
      // Validate the form data using Zod schema
      const validatedData = profileAddressesCreateBody.parse(formData)
      
      await createMutation.mutateAsync({ data: validatedData })
      
      queryClient.invalidateQueries({ queryKey: ["/api/profile/addresses/"] })
      
      toast.success("Address created successfully")
      navigate({ to: "/addresses" })
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to create address: ${error.message}`)
      } else {
        toast.error("Failed to create address")
      }
    }
  }

  const handleCancel = () => {
    navigate({ to: "/addresses" })
  }

  return (
    <AddressForm
      title="Create New Address"
      description="Add a new shipping or billing address"
      onSubmit={handleSubmit}
      submitButtonText="Create Address"
      isSubmitting={createMutation.isPending}
      onCancel={handleCancel}
    />
  )
}

export const Route = createFileRoute('/_authenticated/addresses/new')({
  component: NewAddressPage,
}) 
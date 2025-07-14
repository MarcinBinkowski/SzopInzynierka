"use client"

import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router"
import { useProfileAddressesRetrieve, useProfileAddressesUpdate } from "@/api/generated/shop/profile/profile"
import { profileAddressesUpdateBody } from "@/api/generated/shop/profile/profile.zod"
import { AddressForm } from "@/components/addresses/AddressForm"
import { Spinner } from "@/components/customui/spinner"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { z } from "zod"

// Use the generated Zod schema types
type AddressFormData = z.infer<typeof profileAddressesUpdateBody>

function EditAddressPage() {
  const navigate = useNavigate()
  const { addressId } = useParams({ from: "/_authenticated/addresses/$addressId/edit" })
  const updateMutation = useProfileAddressesUpdate()
  const queryClient = useQueryClient()
  
  const { data: address, isLoading, error } = useProfileAddressesRetrieve(Number(addressId))

  const handleSubmit = async (formData: AddressFormData) => {
    try {
      // Validate the form data using Zod schema
      const validatedData = profileAddressesUpdateBody.parse(formData)
      
      await updateMutation.mutateAsync({ 
        id: Number(addressId), 
        data: validatedData 
      })
      
      queryClient.invalidateQueries({ queryKey: ["/api/profile/addresses/"] })
      queryClient.invalidateQueries({ queryKey: [`/api/profile/addresses/${Number(addressId)}/`] })
      
      toast.success("Address updated successfully")
      navigate({ to: "/addresses" })
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to update address: ${error.message}`)
      } else {
        toast.error("Failed to update address")
      }
    }
  }

  const handleCancel = () => {
    navigate({ to: "/addresses" })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center space-x-2">
          <Spinner size="lg" />
          <span className="text-sm text-muted-foreground">Loading address...</span>
        </div>
      </div>
    )
  }

  if (error || !address) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center text-red-600">Failed to load address</div>
      </div>
    )
  }

  return (
    <AddressForm
      title="Edit Address"
      description="Update address information"
      initialData={address}
      onSubmit={handleSubmit}
      submitButtonText="Update Address"
      isSubmitting={updateMutation.isPending}
      onCancel={handleCancel}
    />
  )
}

export const Route = createFileRoute('/_authenticated/addresses/$addressId/edit')({
  component: EditAddressPage,
}) 
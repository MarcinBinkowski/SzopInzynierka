"use client"

import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useProfileProfilesCreate } from "@/api/generated/shop/profile/profile"
import { profileProfilesCreateBody } from "@/api/generated/shop/profile/profile.zod"
import { ProfileForm, type ProfileUpdateData } from "@/components/profiles/ProfileForm"
import { toast } from "sonner"
import { z } from "zod"

// Use the generated Zod schema types
type ProfileFormData = z.infer<typeof profileProfilesCreateBody>

function NewProfilePage() {
  const navigate = useNavigate()
  const createMutation = useProfileProfilesCreate()

  const handleSubmit = async (formData: ProfileFormData | ProfileUpdateData) => {
    try {
      // Validate the form data using Zod schema
      const validatedData = profileProfilesCreateBody.parse(formData as ProfileFormData)
      
      await createMutation.mutateAsync({ data: validatedData })
      toast.success("Profile created successfully")
      navigate({ to: "/profiles" })
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to create profile: ${error.message}`)
      } else {
        toast.error("Failed to create profile")
      }
    }
  }

  const handleCancel = () => {
    navigate({ to: "/profiles" })
  }

  return (
    <ProfileForm
      title="Create New Profile"
      description="Add a new user profile to the system"
      onSubmit={handleSubmit}
      submitButtonText="Create Profile"
      isSubmitting={createMutation.isPending}
      onCancel={handleCancel}
    />
  )
}

export const Route = createFileRoute('/_authenticated/profiles/new')({
  component: NewProfilePage,
}) 
"use client"

import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router"
import { useCatalogTagsRetrieve, useCatalogTagsUpdate } from "@/api/generated/shop/catalog/catalog"
import { catalogTagsUpdateBody } from "@/api/generated/shop/catalog/catalog.zod"
import { TagForm } from "@/components/tags/TagForm"
import { Spinner } from "@/components/customui/spinner"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { z } from "zod"

// Use the generated Zod schema types
type TagFormData = z.infer<typeof catalogTagsUpdateBody>

function EditTagPage() {
  const navigate = useNavigate()
  const { tagId } = useParams({ from: "/_authenticated/catalog/tags/$tagId/edit" })
  const updateMutation = useCatalogTagsUpdate()
  const queryClient = useQueryClient()
  
  const { data: tag, isLoading, error } = useCatalogTagsRetrieve(Number(tagId))

  const handleSubmit = async (formData: TagFormData) => {
    try {
      const validatedData = catalogTagsUpdateBody.parse(formData)
      
      await updateMutation.mutateAsync({ 
        id: Number(tagId), 
        data: validatedData 
      })
      
      queryClient.invalidateQueries({ queryKey: ["/api/catalog/tags/"] })
      queryClient.invalidateQueries({ queryKey: [`/api/catalog/tags/${Number(tagId)}/`] })
      
      toast.success("Tag updated successfully")
      navigate({ to: "/catalog/tags" })
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to update tag: ${error.message}`)
      } else {
        toast.error("Failed to update tag")
      }
    }
  }

  const handleCancel = () => {
    navigate({ to: "/catalog/tags" })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center space-x-2">
          <Spinner size="lg" />
          <span className="text-sm text-muted-foreground">Loading tag...</span>
        </div>
      </div>
    )
  }

  if (error || !tag) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center text-red-600">Failed to load tag</div>
      </div>
    )
  }

  return (
    <TagForm
      key={`tag-edit-${tagId}`}
      title="Edit Tag"
      description="Update tag information"
      initialData={tag}
      onSubmit={handleSubmit}
      submitButtonText="Update Tag"
      isSubmitting={updateMutation.isPending}
      onCancel={handleCancel}
    />
  )
}

export const Route = createFileRoute('/_authenticated/catalog/tags/$tagId/edit')({
  component: EditTagPage,
}) 
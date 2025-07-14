import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCatalogTagsCreate } from "@/api/generated/shop/catalog/catalog";
import { catalogTagsCreateBody } from "@/api/generated/shop/catalog/catalog.zod";
import { TagForm } from "@/components/tags/TagForm";
import { toast } from "sonner";
import { z } from "zod";

type TagFormData = z.infer<typeof catalogTagsCreateBody>;

function NewTagPage() {
  const navigate = useNavigate();
  const createMutation = useCatalogTagsCreate();

  const handleSubmit = async (formData: TagFormData) => {
    try {
      const validatedData = catalogTagsCreateBody.parse(formData);
      await createMutation.mutateAsync({ data: validatedData });
      toast.success("Tag created successfully");
      navigate({ to: "/catalog/tags" });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to create tag: ${error.message}`);
      } else {
        toast.error("Failed to create tag");
      }
    }
  };

  const handleCancel = () => {
    navigate({ to: "/catalog/tags" });
  };

  return (
    <TagForm
      title="Create New Tag"
      description="Add a new tag to the catalog"
      onSubmit={handleSubmit}
      submitButtonText="Create Tag"
      isSubmitting={createMutation.isPending}
      onCancel={handleCancel}
    />
  );
}

export const Route = createFileRoute("/_authenticated/catalog/tags/new")({
  component: NewTagPage,
});

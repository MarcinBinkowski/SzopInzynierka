import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import {
  useCatalogTagsRetrieve,
  useCatalogTagsUpdate,
} from "@/api/generated/shop/catalog/catalog";
import { catalogTagsUpdateBody } from "@/api/generated/shop/catalog/catalog.zod";
import { TagForm } from "@/components/tags/TagForm";
import { Spinner } from "@/components/common/Spinner";
import { toast } from "sonner";
import { z } from "zod";

type TagFormData = z.infer<typeof catalogTagsUpdateBody>;

function EditTagPage() {
  const navigate = useNavigate();
  const { tagId } = useParams({
    from: "/_authenticated/catalog/tags/$tagId/edit",
  });
  const updateMutation = useCatalogTagsUpdate();

  const { data: tag, isLoading, error } = useCatalogTagsRetrieve(Number(tagId));

  const handleSubmit = async (formData: TagFormData) => {
    try {
      const validatedData = catalogTagsUpdateBody.parse(formData);
      await updateMutation.mutateAsync({
        id: Number(tagId),
        data: validatedData,
      });
      toast.success("Tag updated successfully");
      navigate({ to: "/catalog/tags" });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to update tag: ${error.message}`);
      } else {
        toast.error("Failed to update tag");
      }
    }
  };

  const handleCancel = () => {
    navigate({ to: "/catalog/tags" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Spinner size="lg" />
          <span className="text-sm text-muted-foreground">Loading tag...</span>
        </div>
      </div>
    );
  }

  if (error || !tag) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-600">Failed to load tag</div>
      </div>
    );
  }

  return (
    <TagForm
      title="Edit Tag"
      description="Update tag information"
      initialData={tag}
      onSubmit={handleSubmit}
      submitButtonText="Update Tag"
      isSubmitting={updateMutation.isPending}
      onCancel={handleCancel}
    />
  );
}

export const Route = createFileRoute(
  "/_authenticated/catalog/tags/$tagId/edit",
)({
  component: EditTagPage,
});

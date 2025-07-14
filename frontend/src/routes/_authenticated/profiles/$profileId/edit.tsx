import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import {
  useProfileProfilesRetrieve,
  useProfileProfilesUpdate,
} from "@/api/generated/shop/profile/profile";
import { profileProfilesUpdateBody } from "@/api/generated/shop/profile/profile.zod";
import {
  ProfileForm,
  type ProfileUpdateData,
} from "@/components/profiles/ProfileForm";
import { Spinner } from "@/components/common/Spinner";
import { toast } from "sonner";
import { z } from "zod";

type ProfileFormData = z.infer<typeof profileProfilesUpdateBody>;

function EditProfilePage() {
  const navigate = useNavigate();
  const { profileId } = useParams({
    from: "/_authenticated/profiles/$profileId/edit",
  });
  const updateMutation = useProfileProfilesUpdate();

  const {
    data: profile,
    isLoading,
    error,
  } = useProfileProfilesRetrieve(Number(profileId));

  const handleSubmit = async (
    formData: ProfileFormData | ProfileUpdateData,
  ) => {
    try {
      const validatedData = profileProfilesUpdateBody.parse(
        formData as ProfileUpdateData,
      );

      await updateMutation.mutateAsync({
        id: Number(profileId),
        data: validatedData,
      });
      toast.success("Profile updated successfully");
      navigate({ to: "/profiles" });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to update profile: ${error.message}`);
      } else {
        toast.error("Failed to update profile");
      }
    }
  };

  const handleCancel = () => {
    navigate({ to: "/profiles" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Spinner size="lg" />
          <span className="text-sm text-muted-foreground">
            Loading profile...
          </span>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-600">Failed to load profile</div>
      </div>
    );
  }

  return (
    <ProfileForm
      title="Edit Profile"
      description="Update profile information"
      initialData={profile}
      onSubmit={handleSubmit}
      submitButtonText="Update Profile"
      isSubmitting={updateMutation.isPending}
      onCancel={handleCancel}
    />
  );
}

export const Route = createFileRoute(
  "/_authenticated/profiles/$profileId/edit",
)({
  component: EditProfilePage,
});

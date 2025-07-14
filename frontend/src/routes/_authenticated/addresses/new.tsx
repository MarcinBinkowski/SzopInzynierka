import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useProfileAddressesCreate } from "@/api/generated/shop/profile/profile";
import {
  profileAddressesCreateBody,
  profileAddressesUpdateBody,
} from "@/api/generated/shop/profile/profile.zod";
import { AddressForm } from "@/components/addresses/AddressForm";
import { toast } from "sonner";
import { z } from "zod";

type AddressCreateData = z.infer<typeof profileAddressesCreateBody>;
type AddressUpdateData = z.infer<typeof profileAddressesUpdateBody>;
type AddressFormData = AddressCreateData | AddressUpdateData;

function NewAddressPage() {
  const navigate = useNavigate();
  const createMutation = useProfileAddressesCreate();

  const handleSubmit = async (formData: AddressFormData) => {
    try {
      const validatedData = profileAddressesCreateBody.parse(formData);
      await createMutation.mutateAsync({ data: validatedData });
      toast.success("Address created successfully");
      navigate({ to: "/addresses" });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to create address: ${error.message}`);
      } else {
        toast.error("Failed to create address");
      }
    }
  };

  const handleCancel = () => {
    navigate({ to: "/addresses" });
  };

  return (
    <AddressForm
      title="Create New Address"
      description="Add a new address to your account"
      onSubmit={handleSubmit}
      submitButtonText="Create Address"
      isSubmitting={createMutation.isPending}
      onCancel={handleCancel}
    />
  );
}

export const Route = createFileRoute("/_authenticated/addresses/new")({
  component: NewAddressPage,
});

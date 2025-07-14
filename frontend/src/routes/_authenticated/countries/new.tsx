import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useGeographicCountriesCreate } from "@/api/generated/shop/geographic/geographic";
import { geographicCountriesCreateBody } from "@/api/generated/shop/geographic/geographic.zod";
import { CountryForm } from "@/components/countries/CountryForm";
import { toast } from "sonner";
import { z } from "zod";

type CountryFormData = z.infer<typeof geographicCountriesCreateBody>;

function NewCountryPage() {
  const navigate = useNavigate();
  const createMutation = useGeographicCountriesCreate();

  const handleSubmit = async (formData: CountryFormData) => {
    try {
      const validatedData = geographicCountriesCreateBody.parse(formData);
      await createMutation.mutateAsync({ data: validatedData });

      toast.success("Country created successfully");
      navigate({ to: "/countries" });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to create country: ${error.message}`);
      } else {
        toast.error("Failed to create country");
      }
    }
  };

  const handleCancel = () => {
    navigate({ to: "/countries" });
  };

  return (
    <CountryForm
      title="Create New Country"
      description="Add a new country to the system"
      onSubmit={handleSubmit}
      submitButtonText="Create Country"
      isSubmitting={createMutation.isPending}
      onCancel={handleCancel}
    />
  );
}

export const Route = createFileRoute("/_authenticated/countries/new")({
  component: NewCountryPage,
});

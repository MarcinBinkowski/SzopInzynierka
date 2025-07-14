import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import {
  useGeographicCountriesRetrieve,
  useGeographicCountriesUpdate,
} from "@/api/generated/shop/geographic/geographic";
import { geographicCountriesUpdateBody } from "@/api/generated/shop/geographic/geographic.zod";
import { CountryForm } from "@/components/countries/CountryForm";
import { toast } from "sonner";
import { z } from "zod";
import { Spinner } from "@/components/common/Spinner";

type CountryFormData = z.infer<typeof geographicCountriesUpdateBody>;

function EditCountryPage() {
  const navigate = useNavigate();
  const { countryId } = useParams({
    from: "/_authenticated/countries/$countryId/edit",
  });
  const updateMutation = useGeographicCountriesUpdate();

  const {
    data: country,
    isLoading,
    error,
  } = useGeographicCountriesRetrieve(parseInt(countryId), {
    query: {
      enabled: !!countryId,
    },
  });

  const handleSubmit = async (formData: CountryFormData) => {
    try {
      const validatedData = geographicCountriesUpdateBody.parse(formData);
      await updateMutation.mutateAsync({
        id: parseInt(countryId),
        data: validatedData,
      });

      toast.success("Country updated successfully");
      navigate({ to: "/countries" });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to update country: ${error.message}`);
      } else {
        toast.error("Failed to update country");
      }
    }
  };

  const handleCancel = () => {
    navigate({ to: "/countries" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Spinner size="lg" />
          <span className="text-sm text-muted-foreground">
            Loading country...
          </span>
        </div>
      </div>
    );
  }

  if (error || !country) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-600">Failed to load country</div>
      </div>
    );
  }

  return (
    <CountryForm
      title="Edit Country"
      description="Update country information"
      initialData={country}
      onSubmit={handleSubmit}
      submitButtonText="Update Country"
      isSubmitting={updateMutation.isPending}
      onCancel={handleCancel}
    />
  );
}

export const Route = createFileRoute(
  "/_authenticated/countries/$countryId/edit",
)({
  component: EditCountryPage,
});

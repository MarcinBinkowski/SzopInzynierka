import { useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type MRT_ColumnDef } from "material-react-table";
import {
  useGeographicCountriesList,
  useGeographicCountriesDestroy,
} from "@/api/generated/shop/geographic/geographic";
import { CrudListPage } from "@/components/common/listPages";
import { createDateColumn } from "@/components/common/listPageHelpers/columnHelpers";

function CountriesPage() {
  const navigate = useNavigate();
  const deleteMutation = useGeographicCountriesDestroy();

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "code", header: "Code" },
      { accessorKey: "name", header: "Name" },
      createDateColumn("created_at", "Created"),
    ],
    [],
  );

  const handleDelete = async (row: any) => {
    if (confirm(`Delete country "${row.name}"?`)) {
      await deleteMutation.mutateAsync({ id: row.id });
    }
  };

  return (
    <CrudListPage
      title="Countries"
      columns={columns}
      useData={useGeographicCountriesList}
      onAdd={() => navigate({ to: "/countries/new" })}
      onEdit={(row) => navigate({ to: `/countries/${row.id}/edit` })}
      onDelete={handleDelete}
      enablePagination={false}
    />
  );
}

export const Route = createFileRoute("/_authenticated/countries/")({
  component: CountriesPage,
});

import { useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type MRT_ColumnDef } from "material-react-table";
import {
  useCatalogManufacturersList,
  useCatalogManufacturersDestroy,
} from "@/api/generated/shop/catalog/catalog";
import { CrudListPage } from "@/components/common/listPages";
import {
  createDateColumn,
  createBooleanColumn,
} from "@/components/common/listPageHelpers/columnHelpers";

function ManufacturersPage() {
  const navigate = useNavigate();
  const deleteMutation = useCatalogManufacturersDestroy();

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "name", header: "Name" },
      { accessorKey: "slug", header: "Slug" },
      createBooleanColumn("is_active", "Active"),
      createDateColumn("created_at", "Created"),
    ],
    [],
  );

  const handleDelete = async (row: any) => {
    if (confirm(`Delete manufacturer "${row.name}"?`)) {
      await deleteMutation.mutateAsync({ id: row.id });
    }
  };

  return (
    <CrudListPage
      title="Manufacturers"
      columns={columns}
      useData={useCatalogManufacturersList}
      onAdd={() => navigate({ to: "/catalog/manufacturers/new" })}
      onEdit={(row) =>
        navigate({ to: `/catalog/manufacturers/${row.id}/edit` })
      }
      onDelete={handleDelete}
      enablePagination={false}
    />
  );
}

export const Route = createFileRoute("/_authenticated/catalog/manufacturers/")({
  component: ManufacturersPage,
});

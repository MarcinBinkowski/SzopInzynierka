import { useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type MRT_ColumnDef } from "material-react-table";
import {
  useCatalogCategoriesList,
  useCatalogCategoriesDestroy,
} from "@/api/generated/shop/catalog/catalog";
import { CrudListPage } from "@/components/common/listPages";
import {
  createDateColumn,
  createBooleanColumn,
} from "@/components/common/listPageHelpers/columnHelpers";

function CategoriesPage() {
  const navigate = useNavigate();
  const deleteMutation = useCatalogCategoriesDestroy();

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "name", header: "Name" },
      { accessorKey: "slug", header: "Slug" },
      { accessorKey: "description", header: "Description" },
      createBooleanColumn("is_active", "Active"),
      createDateColumn("created_at", "Created"),
    ],
    [],
  );

  const handleDelete = async (row: any) => {
    if (confirm(`Delete category "${row.name}"?`)) {
      await deleteMutation.mutateAsync({ id: row.id });
    }
  };

  return (
    <CrudListPage
      title="Categories"
      columns={columns}
      useData={useCatalogCategoriesList}
      onAdd={() => navigate({ to: "/catalog/categories/new" })}
      onEdit={(row) => navigate({ to: `/catalog/categories/${row.id}/edit` })}
      onDelete={handleDelete}
    />
  );
}

export const Route = createFileRoute("/_authenticated/catalog/categories/")({
  component: CategoriesPage,
});

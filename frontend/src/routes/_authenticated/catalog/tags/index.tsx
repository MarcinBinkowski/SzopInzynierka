import { useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type MRT_ColumnDef } from "material-react-table";
import {
  useCatalogTagsList,
  useCatalogTagsDestroy,
} from "@/api/generated/shop/catalog/catalog";
import { CrudListPage } from "@/components/common/listPages";
import { createDateColumn } from "@/components/common/listPageHelpers/columnHelpers";
import { toast } from "sonner";

function TagsPage() {
  const navigate = useNavigate();
  const deleteMutation = useCatalogTagsDestroy();

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "name", header: "Name" },
      { accessorKey: "slug", header: "Slug" },
      createDateColumn("created_at", "Created"),
      createDateColumn("updated_at", "Updated"),
    ],
    [],
  );

  const handleDelete = async (row: any) => {
    if (confirm(`Delete tag "${row.name}"?`)) {
      await deleteMutation.mutateAsync({ id: row.id });
    }
  };

  return (
    <CrudListPage
      title="Tags"
      columns={columns}
      useData={useCatalogTagsList}
      onAdd={() => navigate({ to: "/catalog/tags/new" })}
      onEdit={(row) => navigate({ to: `/catalog/tags/${row.id}/edit` })}
      onDelete={handleDelete}
    />
  );
}

export const Route = createFileRoute("/_authenticated/catalog/tags/")({
  component: TagsPage,
});

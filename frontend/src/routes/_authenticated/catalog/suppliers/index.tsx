import { createFileRoute, useNavigate } from "@tanstack/react-router";
import type { MRT_ColumnDef } from "material-react-table";
import { CrudListPage } from "@/components/common/listPages";
import {
  useCatalogSuppliersList,
  useCatalogSuppliersDestroy,
} from "@/api/generated/shop/catalog/catalog";
import type { Supplier } from "@/api/generated/shop/schemas";
import { useMemo } from "react";
import { createDateColumn } from "@/components/common/listPageHelpers/columnHelpers";

function SuppliersPage() {
  const navigate = useNavigate();
  const deleteMutation = useCatalogSuppliersDestroy();

  const columns = useMemo<MRT_ColumnDef<Supplier>[]>(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "name", header: "Name" },
      { accessorKey: "contact_email", header: "Email" },
      { accessorKey: "phone", header: "Phone" },
      createDateColumn("created_at", "Created"),
      createDateColumn("updated_at", "Updated"),
    ],
    [],
  );

  const handleDelete = async (row: Supplier) => {
    if (confirm(`Delete supplier "${row.name}"?`)) {
      await deleteMutation.mutateAsync({ id: row.id });
    }
  };

  return (
    <CrudListPage<Supplier>
      title="Suppliers"
      columns={columns}
      useData={useCatalogSuppliersList}
      onAdd={() => navigate({ to: "/catalog/suppliers/new" })}
      onEdit={(row) => navigate({ to: `/catalog/suppliers/${row.id}/edit` })}
      onDelete={handleDelete}
    />
  );
}

export const Route = createFileRoute("/_authenticated/catalog/suppliers/")({
  component: SuppliersPage,
});

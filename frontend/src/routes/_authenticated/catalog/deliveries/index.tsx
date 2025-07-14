import { createFileRoute, useNavigate } from "@tanstack/react-router";
import type { MRT_ColumnDef } from "material-react-table";
import { CrudListPage } from "@/components/common/listPages";
import {
  useCatalogDeliveriesList,
  useCatalogDeliveriesDestroy,
} from "@/api/generated/shop/catalog/catalog";
import type { ProductDelivery } from "@/api/generated/shop/schemas";
import { useMemo } from "react";
import { createDateColumn } from "@/components/common/listPageHelpers/columnHelpers";

function DeliveriesPage() {
  const navigate = useNavigate();
  const deleteMutation = useCatalogDeliveriesDestroy();

  const columns = useMemo<MRT_ColumnDef<ProductDelivery>[]>(
    () => [
      { accessorKey: "id", header: "ID" },
      {
        accessorKey: "supplier_name",
        header: "Supplier",
        Cell: ({ row }) => row.original.supplier_name || "-",
      },
      {
        accessorKey: "product_name",
        header: "Product",
        Cell: ({ row }) => row.original.product_name || "-",
      },
      { accessorKey: "quantity", header: "Qty" },
      {
        accessorKey: "cost_per_unit",
        header: "Cost/Unit",
        Cell: ({ row }) => row.original.cost_per_unit ? `€${row.original.cost_per_unit}` : "-",
      },
      createDateColumn("delivery_date", "Delivered"),
      createDateColumn("created_at", "Created"),
    ],
    [],
  );

  const handleDelete = async (row: ProductDelivery) => {
    if (confirm(`Delete delivery #${row.id}?`)) {
      await deleteMutation.mutateAsync({ id: row.id });
    }
  };

  return (
    <CrudListPage<ProductDelivery>
      title="Product Deliveries"
      columns={columns}
      useData={useCatalogDeliveriesList}
      onAdd={() => navigate({ to: "/catalog/deliveries/new" })}
      onEdit={(row) => navigate({ to: `/catalog/deliveries/${row.id}/edit` })}
      onDelete={handleDelete}
    />
  );
}

export const Route = createFileRoute("/_authenticated/catalog/deliveries/")({
  component: DeliveriesPage,
});

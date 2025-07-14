import { createFileRoute, useNavigate } from "@tanstack/react-router";
import type { MRT_ColumnDef } from "material-react-table";
import { CrudListPage } from "@/components/common/listPages";
import {
  useCheckoutShipmentsList,
  useCheckoutShipmentsDestroy,
} from "@/api/generated/shop/checkout/checkout";
import type { Shipment } from "@/api/generated/shop/schemas";
import { useMemo } from "react";
import { createDateColumn } from "@/components/common/listPageHelpers/columnHelpers";

function ShipmentsPage() {
  const navigate = useNavigate();
  const deleteMutation = useCheckoutShipmentsDestroy();

  const columns = useMemo<MRT_ColumnDef<Shipment>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
      },
      {
        accessorKey: "order__order_number",
        header: "Order",
        Cell: ({ row }) => row.original.order_number,
      },
      {
        accessorKey: "order__shipping_method__name",
        header: "Method",
        Cell: ({ row }) => row.original.shipping_method,
      },
      {
        accessorKey: "order__shipping_method__courier__name",
        header: "Courier",
        Cell: ({ row }) => row.original.courier,
      },
      createDateColumn("shipped_at", "Shipped"),
      createDateColumn("delivered_at", "Delivered"),
    ],
    [],
  );

  const handleDelete = async (row: Shipment) => {
    if (confirm(`Delete shipment for ${row.order_number}?`)) {
      await deleteMutation.mutateAsync({ id: row.id });
    }
  };

  return (
    <CrudListPage<Shipment>
      title="Shipments"
      columns={columns}
      useData={useCheckoutShipmentsList}
      onEdit={(row) => navigate({ to: `/checkout/shipments/${row.id}/edit` })}
      onDelete={handleDelete}
      entityType="shipment"
    />
  );
}

export const Route = createFileRoute("/_authenticated/checkout/shipments/")({
  component: ShipmentsPage,
});

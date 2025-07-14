import { createFileRoute, useNavigate } from "@tanstack/react-router";
import type { MRT_ColumnDef } from "material-react-table";
import { CrudListPage } from "@/components/common/listPages";
import {
  useCheckoutCouriersList,
  useCheckoutCouriersDestroy,
} from "@/api/generated/shop/checkout/checkout";
import type { Courier } from "@/api/generated/shop/schemas";
import { useMemo } from "react";
import { createDateColumn } from "@/components/common/listPageHelpers/columnHelpers";

function CouriersPage() {
  const navigate = useNavigate();
  const deleteMutation = useCheckoutCouriersDestroy();

  const columns = useMemo<MRT_ColumnDef<Courier>[]>(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "name", header: "Name" },
      createDateColumn("created_at", "Created"),
    ],
    [],
  );

  const handleDelete = async (row: Courier) => {
    if (confirm(`Delete courier "${row.name}"?`)) {
      await deleteMutation.mutateAsync({ id: row.id });
    }
  };

  return (
    <CrudListPage<Courier>
      title="Couriers"
      columns={columns}
      useData={useCheckoutCouriersList}
      onAdd={() => navigate({ to: "/checkout/couriers/new" })}
      onEdit={(row) => navigate({ to: `/checkout/couriers/${row.id}/edit` })}
      onDelete={handleDelete}
    />
  );
}

export const Route = createFileRoute("/_authenticated/checkout/couriers/")({
  component: CouriersPage,
});

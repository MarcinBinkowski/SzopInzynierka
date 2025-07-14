import { useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type MRT_ColumnDef } from "material-react-table";
import { useCheckoutOrdersList } from "@/api/generated/shop/checkout/checkout";
import { GenericReadOnlyListPage } from "@/components/common/listPages";
import {
  createDateColumn,
  createStatusColumn,
  createPriceColumn,
} from "@/components/common/listPageHelpers/columnHelpers";

function OrdersPage() {
  const navigate = useNavigate();

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "order_number", header: "Order Number" },
      createStatusColumn("status", "Status"),
      createPriceColumn("subtotal", "Subtotal"),
      createPriceColumn("total", "Total"),
      createDateColumn("created_at", "Created"),
    ],
    [],
  );

  const useListHook = (params: any) => {
    const result = useCheckoutOrdersList(params?.query);
    return {
      data: result.data,
      isLoading: result.isLoading,
      refetch: result.refetch || (() => {}),
    };
  };

  const customRowActions = (row: any) => [
    {
      label: "View",
      onClick: () => navigate({ to: `/orders/${row.id}` }),
      variant: "outline" as const,
    },
  ];

  return (
    <GenericReadOnlyListPage
      title="Orders"
      columns={columns}
      useListHook={useListHook}
      customRowActions={customRowActions}
    />
  );
}

export const Route = createFileRoute("/_authenticated/orders/")({
  component: OrdersPage,
});

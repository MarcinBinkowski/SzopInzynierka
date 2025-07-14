import { createFileRoute } from "@tanstack/react-router";
import type { MRT_ColumnDef } from "material-react-table";
import { GenericReadOnlyListPage } from "@/components/common/listPages";
import { useCheckoutPaymentsList } from "@/api/generated/shop/checkout/checkout";
import type { Payment } from "@/api/generated/shop/schemas";
import { useMemo } from "react";
import { createDateColumn } from "@/components/common/listPageHelpers/columnHelpers";

function useListHook(params: { query: any }) {
  const { data, isLoading } = useCheckoutPaymentsList(params.query);
  return { data, isLoading, refetch: () => {} };
}

function PaymentsPage() {
  const columns = useMemo<MRT_ColumnDef<Payment>[]>(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "amount", header: "Amount" },
      { accessorKey: "status", header: "Status" },
      { accessorKey: "stripe_payment_intent_id", header: "Intent" },
      { accessorKey: "description", header: "Description" },
      createDateColumn("created_at", "Created"),
    ],
    [],
  );

  return (
    <GenericReadOnlyListPage<Payment>
      title="Payments"
      columns={columns}
      useListHook={useListHook as any}
    />
  );
}

export const Route = createFileRoute("/_authenticated/checkout/payments/")({
  component: PaymentsPage,
});

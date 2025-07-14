import { createFileRoute } from "@tanstack/react-router";
import { GenericReadOnlyListPage } from "@/components/common/listPages";
import {
  useCheckoutInvoicesList,
  checkoutInvoicesDownloadByOrderRetrieve,
} from "@/api/generated/shop/checkout/checkout";
import type { Invoice } from "@/api/generated/shop/schemas";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { createDateColumn } from "@/components/common/listPageHelpers/columnHelpers";
import type { MRT_ColumnDef } from "material-react-table";

const columns: MRT_ColumnDef<Invoice>[] = [
  {
    accessorKey: "invoice_number",
    header: "Invoice #",
    Cell: ({ cell }) => (
      <span className="font-mono font-medium">{cell.getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "order_number",
    header: "Order",
    Cell: ({ cell }) => (
      <span className="font-mono">{cell.getValue<string>()}</span>
    ),
  },
  createDateColumn("created_at", "Created"),
];

export const Route = createFileRoute("/_authenticated/checkout/invoices/")({
  component: InvoicesPage,
});

function InvoicesPage() {
  const downloadInvoiceMutation = useMutation({
    mutationFn: async (orderId: number) => {
      const blob = await checkoutInvoicesDownloadByOrderRetrieve({
        order_id: orderId,
      });
      return blob;
    },
    onSuccess: (blob, orderId) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice_${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Invoice downloaded for order ${orderId}`);
    },
    onError: (error) => {
      console.error("Error downloading invoice:", error);
      toast.error("Failed to download invoice");
    },
  });

  const useListHook = (params: any) => {
    const result = useCheckoutInvoicesList(params?.query);
    return {
      data: result.data,
      isLoading: result.isLoading,
      refetch: result.refetch || (() => {}),
    };
  };

  return (
    <GenericReadOnlyListPage
      title="Invoices"
      columns={columns}
      useListHook={useListHook}
      customRowActions={(row: Invoice) => [
        {
          label: "Download",
          variant: "outline" as const,
          onClick: () => {
            downloadInvoiceMutation.mutate(row.order);
          },
        },
      ]}
    />
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CrudListPage } from "@/components/common/listPages/CrudListPage";
import {
  useCheckoutShippingMethodsList,
  useCheckoutShippingMethodsDestroy,
} from "@/api/generated/shop/checkout/checkout";
import type { ShippingMethod } from "@/api/generated/shop/schemas";
import { Badge } from "@/components/ui/badge";
import type { MRT_ColumnDef } from "material-react-table";

const columns: MRT_ColumnDef<ShippingMethod>[] = [
  {
    accessorKey: "name",
    header: "Shipping Method",
    Cell: ({ cell }) => (
      <span className="font-medium">{cell.getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "price",
    header: "Cost",
    Cell: ({ cell }) => {
      const price = cell.getValue<string>();
      if (!price || parseFloat(price) === 0) {
        return <Badge variant="secondary">Free</Badge>;
      }
      return <span className="font-mono">€{parseFloat(price).toFixed(2)}</span>;
    },
  },
  {
    id: "status",
    header: "Status",
    Cell: () => <Badge variant="default">Active</Badge>,
  },
];

export const Route = createFileRoute(
  "/_authenticated/checkout/shipping-methods/",
)({
  component: ShippingMethodsPage,
});

function ShippingMethodsPage() {
  const navigate = useNavigate();
  const deleteMutation = useCheckoutShippingMethodsDestroy();

  return (
    <CrudListPage
      title="Shipping Methods"
      columns={columns}
      useData={useCheckoutShippingMethodsList}
      onAdd={() => navigate({ to: "/checkout/shipping-methods/new" })}
      onEdit={(row) =>
        navigate({ to: `/checkout/shipping-methods/${row.id}/edit` })
      }
      onDelete={async (row) => {
        if (confirm(`Delete shipping method "${row.name}"?`)) {
          await deleteMutation.mutateAsync({ id: Number(row.id) });
        }
      }}
    />
  );
}

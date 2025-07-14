import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CrudListPage } from "@/components/common/listPages/CrudListPage";
import {
  useCheckoutCouponsList,
  useCheckoutCouponsDestroy,
} from "@/api/generated/shop/checkout/checkout";
import type { Coupon } from "@/api/generated/shop/schemas";
import type { MRT_ColumnDef } from "material-react-table";

const columns: MRT_ColumnDef<Coupon>[] = [
  {
    accessorKey: "code",
    header: "Code",
    Cell: ({ cell }) => (
      <span className="font-mono font-medium">{cell.getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "discount_amount",
    header: "Discount",
    Cell: ({ cell }) => {
      const value = cell.getValue<string>();
      return value ? `€${value}` : "-";
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    Cell: ({ cell }) => {
      const desc = cell.getValue<string>();
      return desc
        ? desc.length > 50
          ? `${desc.substring(0, 50)}...`
          : desc
        : "-";
    },
  },
  {
    accessorKey: "usage_count",
    header: "Usage Count",
    Cell: ({ cell }) => {
      const usageCount = cell.getValue<number>();
      return usageCount ? usageCount.toString() : "0";
    },
  },
  {
    accessorKey: "max_uses",
    header: "Max Uses",
    Cell: ({ cell }) => {
      const maxUses = cell.getValue<number>();
      return maxUses ? maxUses.toString() : "Unlimited";
    },
  },
  {
    accessorKey: "valid_from",
    header: "Valid From",
    Cell: ({ cell }) => {
      const date = cell.getValue<string>();
      return date ? new Date(date).toLocaleDateString() : "-";
    },
  },
  {
    accessorKey: "valid_until",
    header: "Valid Until",
    Cell: ({ cell }) => {
      const date = cell.getValue<string>();
      return date ? new Date(date).toLocaleDateString() : "-";
    },
  },
];

export const Route = createFileRoute("/_authenticated/checkout/coupons/")({
  component: CouponsPage,
});

function CouponsPage() {
  const navigate = useNavigate();
  const deleteMutation = useCheckoutCouponsDestroy();

  const handleDelete = async (row: any) => {
    if (confirm(`Delete coupon "${row.code}"?`)) {
      await deleteMutation.mutateAsync({ id: row.id });
    }
  };

  return (
    <CrudListPage
      title="Coupons"
      columns={columns}
      useData={useCheckoutCouponsList}
      onAdd={() => navigate({ to: "/checkout/coupons/new" })}
      onEdit={(row) => navigate({ to: `/checkout/coupons/${row.id}/edit` })}
      onDelete={handleDelete}
    />
  );
}

import { createFileRoute } from "@tanstack/react-router"
import type { MRT_ColumnDef } from "material-react-table"
import { GenericReadOnlyListPage } from "@/components/common/listPages"
import { useCheckoutCouponRedemptionsList } from "@/api/generated/shop/checkout/checkout"
import type { CouponRedemption } from "@/api/generated/shop/schemas"
import { useMemo } from "react"
import { createDateColumn } from "@/components/common/listPageHelpers/columnHelpers"

function useListHook(params: { page?: number; page_size?: number }) {
  const { data, isLoading } = useCheckoutCouponRedemptionsList({ page: params.page, page_size: params.page_size })
  return { data, isLoading, refetch: () => {} }
}

function CouponRedemptionsPage() {
  const columns = useMemo<MRT_ColumnDef<CouponRedemption>[]>(() => [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "coupon.code", header: "Code" },
    { accessorKey: "coupon.name", header: "Coupon" },
    { accessorKey: "discount_amount", header: "Discount" },
    { accessorKey: "original_total", header: "Original" },
    { accessorKey: "final_total", header: "Final" },
    createDateColumn("created_at", "Created"),
  ], [])

  return (
    <GenericReadOnlyListPage<CouponRedemption>
      title="Coupon Redemptions"
      columns={columns}
      useListHook={useListHook as any}
    />
  )
}

export const Route = createFileRoute('/_authenticated/checkout/coupon-redemptions/')({
  component: CouponRedemptionsPage,
})


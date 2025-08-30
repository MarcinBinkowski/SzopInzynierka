import { createFileRoute } from "@tanstack/react-router"
import type { MRT_ColumnDef } from "material-react-table"
import { GenericReadOnlyListPage } from "@/components/common/listPages"
import { useCheckoutShipmentsList } from "@/api/generated/shop/checkout/checkout"
import type { Shipment } from "@/api/generated/shop/schemas"
import { useMemo } from "react"
import { createDateColumn } from "@/components/common/listPageHelpers/columnHelpers"

function ShipmentsPage() {
  const columns = useMemo<MRT_ColumnDef<Shipment>[]>(() => [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "order", header: "Order" },
    { accessorKey: "shipping_method", header: "Method" },
    { accessorKey: "courier", header: "Courier" },
    createDateColumn("shipped_at", "Shipped"),
    createDateColumn("delivered_at", "Delivered"),
  ], [])

  function useListHook(params: { page?: number; page_size?: number }) {
    const { data, isLoading } = useCheckoutShipmentsList({ page: params.page, page_size: params.page_size })
    return { data, isLoading, refetch: () => {} }
  }

  return (
    <GenericReadOnlyListPage<Shipment>
      title="Shipments"
      columns={columns}
      useListHook={useListHook as any}
    />
  )
}

export const Route = createFileRoute('/_authenticated/checkout/shipments/')({
  component: ShipmentsPage,
})



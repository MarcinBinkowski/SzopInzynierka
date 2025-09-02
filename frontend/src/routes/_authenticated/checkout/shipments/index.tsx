import { createFileRoute, useNavigate } from "@tanstack/react-router"
import type { MRT_ColumnDef } from "material-react-table"
import { CrudListPage } from "@/components/common/listPages"
import { useCheckoutShipmentsList } from "@/api/generated/shop/checkout/checkout"
import type { Shipment } from "@/api/generated/shop/schemas"
import { useMemo } from "react"
import { createDateColumn } from "@/components/common/listPageHelpers/columnHelpers"

function ShipmentsPage() {
  const navigate = useNavigate()
  
  const columns = useMemo<MRT_ColumnDef<Shipment>[]>(() => [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "order", header: "Order" },
    { accessorKey: "shipping_method", header: "Method" },
    { accessorKey: "courier", header: "Courier" },
    createDateColumn("shipped_at", "Shipped"),
    createDateColumn("delivered_at", "Delivered"),
  ], [])

  const useData = (params: any) => {
    const { data, isLoading } = useCheckoutShipmentsList(params)
    return { data, isLoading }
  }

  const handleAdd = () => {
    navigate({ to: '/checkout/shipments/new' })
  }

  const handleEdit = (shipment: Shipment) => {
    navigate({ to: `/checkout/shipments/${shipment.id}/edit` })
  }

  const handleDelete = (shipment: Shipment) => {
    // TODO: Implement delete functionality
    console.log('Delete shipment:', shipment.id)
  }

  return (
    <CrudListPage<Shipment>
      title="Shipments"
      columns={columns}
      useData={useData}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      entityType="shipment"
    />
  )
}

export const Route = createFileRoute('/_authenticated/checkout/shipments/')({
  component: ShipmentsPage,
})



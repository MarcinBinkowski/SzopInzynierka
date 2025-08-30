import { createFileRoute, useNavigate } from "@tanstack/react-router"
import type { MRT_ColumnDef } from "material-react-table"
import { CrudListPage } from "@/components/common/listPages"
import { useCheckoutOrderNotesList, useCheckoutOrderNotesDestroy } from "@/api/generated/shop/checkout/checkout"
import type { OrderProcessingNote } from "@/api/generated/shop/schemas"
import { useMemo } from "react"
import { createDateColumn } from "@/components/common/listPageHelpers/columnHelpers"

function OrderNotesPage() {
  const navigate = useNavigate()
  const deleteMutation = useCheckoutOrderNotesDestroy()

  const columns = useMemo<MRT_ColumnDef<OrderProcessingNote>[]>(() => [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "order", header: "Order" },
    { accessorKey: "staff_member", header: "Staff" },
    { accessorKey: "note", header: "Note" },
    createDateColumn("created_at", "Created"),
  ], [])

  const handleDelete = async (row: OrderProcessingNote) => {
    if (confirm(`Delete note #${row.id}?`)) {
      await deleteMutation.mutateAsync({ id: row.id })
    }
  }

  return (
    <CrudListPage<OrderProcessingNote>
      title="Order Notes"
      columns={columns}
      useData={useCheckoutOrderNotesList}
      onAdd={() => navigate({ to: "/checkout/order-notes/new" })}
      onEdit={(row) => navigate({ to: `/checkout/order-notes/${row.id}/edit` })}
      onDelete={handleDelete}
    />
  )
}

export const Route = createFileRoute('/_authenticated/checkout/order-notes/')({
  component: OrderNotesPage,
})


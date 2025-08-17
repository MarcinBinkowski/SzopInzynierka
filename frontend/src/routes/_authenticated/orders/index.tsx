"use client"

import { useMemo } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table"
import { checkoutInvoicesDownloadByOrderRetrieve, useCheckoutOrdersList } from "@/api/generated/shop/checkout/checkout"
import { useMutation } from "@tanstack/react-query"
import { useServerSideTable } from "@/hooks/useServerSideTable"
import { ListPage } from "@/components/common/listPageHelpers/ListPage"
import { RowActions } from "@/components/common/listPageHelpers/RowActions"
import { createDateColumn } from "@/components/common/listPageHelpers/columnHelpers"

import { Download, Eye } from "lucide-react"
import { toast } from "sonner"

function OrdersPage() {
  const navigate = useNavigate()

  // Use the generic table hook with automatic range filter handling
  const {
    tableState,
    apiParams, 
    onSortingChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
  } = useServerSideTable({
    dateRangeFilterFields: ['created_at'], // Date range filters
  })

  // Remove pagination params since API returns all data
  const { page, page_size, ...filterParams } = apiParams
  const { data, isLoading } = useCheckoutOrdersList(filterParams)
  


  // Define columns using helpers
  const columns = useMemo<MRT_ColumnDef<any>[]>(() => [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "order_number", header: "Order Number" },
    { 
      accessorKey: "status", 
      header: "Status",
      Cell: ({ cell }) => {
        const status = cell.getValue() as string
        return status ? status.charAt(0).toUpperCase() + status.slice(1) : "N/A"
      }
    },
    { 
      accessorKey: "subtotal", 
      header: "Subtotal",
      Cell: ({ cell }) => `$${parseFloat(cell.getValue() as string).toFixed(2)}`
    },
    { 
      accessorKey: "total", 
      header: "Total",
      Cell: ({ cell }) => `$${parseFloat(cell.getValue() as string).toFixed(2)}`
    },
    createDateColumn("created_at", "Created"),
  ], [])

  const downloadInvoiceMutation = useMutation({
    mutationFn: async (orderId: number) => {
      // Use the generated client with order_id parameter
      const blob = await checkoutInvoicesDownloadByOrderRetrieve({ order_id: orderId })
      return blob
    },
    onSuccess: (blob, orderId) => {
      const order = data?.results?.find((o: any) => o.id === orderId)
      const orderNumber = order?.order_number || orderId
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice_${orderNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success(`Invoice downloaded for order ${orderNumber}`)
    },
    onError: (error) => {
      console.error("Error downloading invoice:", error)
      toast.error("Failed to download invoice")
    }
  })

  const rowActions = useMemo(() => [
    {
      label: "View Details",
      icon: Eye,
      onClick: (row: any) => {
        navigate({ to: `/orders/${row.original?.id || row.id}` })
      },
    },
    {
      label: "Download Invoice",
      icon: Download,
      onClick: (row: any) => {
        const order = row.original || row
        downloadInvoiceMutation.mutate(order.id)
      },
    },
  ], [navigate, downloadInvoiceMutation])

  return (
    <ListPage
      title="Orders"
      description="View and manage customer orders"
    >
      <MaterialReactTable
        columns={columns}
        data={data?.results ?? []}
        state={{
          ...tableState,
          isLoading,
        }}
        manualSorting
        manualFiltering
        enableGlobalFilter
        enableRowActions
        renderRowActions={({ row }) => <RowActions row={row} actions={rowActions} />}
        positionActionsColumn="last"
        enableSorting
        muiTableProps={{ sx: { minWidth: 650 } }}
        onSortingChange={onSortingChange}
        onColumnFiltersChange={onColumnFiltersChange}
        onGlobalFilterChange={onGlobalFilterChange}
      />
    </ListPage>
  )
}

export const Route = createFileRoute('/_authenticated/orders/')({
  component: OrdersPage,
}) 
"use client"

import { useMemo } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table"
import { useCheckoutInvoiceTemplatesList, useCheckoutInvoiceTemplatesDestroy } from "@/api/generated/shop/checkout/checkout"
import { useServerSideTable } from "@/hooks/useServerSideTable"
import { ListPage } from "@/components/common/listPageHelpers/ListPage"
import { RowActions } from "@/components/common/listPageHelpers/RowActions"
import { createDateColumn, createTruncatedTextColumn } from "@/components/common/listPageHelpers/columnHelpers"
import { useStandardRowActions } from "@/components/common/listPageHelpers/useStandardRowActions"

function InvoiceTemplatesPage() {
  const navigate = useNavigate()

  // Use the generic table hook with automatic range filter handling
  const {
    tableState,
    apiParams,
    onSortingChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
  } = useServerSideTable({
    dateRangeFilterFields: ['created_at', 'updated_at'], // Date range filters
  })

  // Remove pagination params since API returns all data
  const { page, page_size, ...filterParams } = apiParams
  const { data, isLoading, refetch } = useCheckoutInvoiceTemplatesList(filterParams)
  const deleteMutation = useCheckoutInvoiceTemplatesDestroy()

  // Use the standard row actions abstraction
  const rowActions = useStandardRowActions({
    editRoute: row => `/invoice-templates/${row.original?.id || row.id}/edit`,
    onDelete: async row => {
      await deleteMutation.mutateAsync({ id: row.original?.id || row.id })
      refetch()
    },
    deleteConfirmMessage: row => `Delete template "${row.original?.name || row.name}"?`,
    deleteSuccessMessage: "Template deleted"
  })

  // Define columns using helpers
  const columns = useMemo<MRT_ColumnDef<any>[]>(() => [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name", header: "Name" },
    createTruncatedTextColumn("content", "Content", { maxLength: 100 }),
    { accessorKey: "created_by_name", header: "Created By" },
    createDateColumn("created_at", "Created"),
    createDateColumn("updated_at", "Updated"),
  ], [])

  return (
    <ListPage
      title="Invoice Templates"
      description="Manage your invoice templates for PDF generation"
      addButtonText="Add Template"
      onAdd={() => navigate({ to: "/invoice-templates/new" })}
    >
      <MaterialReactTable
        columns={columns}
        data={data ?? []}
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

export const Route = createFileRoute('/_authenticated/invoice-templates/')({
  component: InvoiceTemplatesPage,
}) 
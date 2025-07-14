"use client"

import { useMemo } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table"
import { useProfileAddressesList, useProfileAddressesDestroy } from "@/api/generated/shop/profile/profile"
import { useServerSideTable } from "@/hooks/useServerSideTable"
import { ListPage } from "@/components/common/listPageHelpers/ListPage"
import { RowActions } from "@/components/common/listPageHelpers/RowActions"
import { createDateColumn } from "@/components/common/listPageHelpers/columnHelpers"
import { useStandardRowActions } from "@/components/common/listPageHelpers/useStandardRowActions"

function AddressesPage() {
  const navigate = useNavigate()

  // Use the generic table hook with automatic range filter handling
  const {
    tableState,
    apiParams,
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
  } = useServerSideTable({
    dateRangeFilterFields: ['created_at'], // Date range filters
  })

  const { data, isLoading, refetch } = useProfileAddressesList(apiParams)
  const deleteMutation = useProfileAddressesDestroy()

  // Use the standard row actions abstraction
  const rowActions = useStandardRowActions({
    editRoute: row => `/addresses/${row.original?.id || row.id}/edit`,
    onDelete: async row => {
      await deleteMutation.mutateAsync({ id: row.original?.id || row.id })
      refetch()
    },
    deleteConfirmMessage: row => `Delete address "${row.original?.full_address || row.full_address}"?`,
    deleteSuccessMessage: "Address deleted"
  })

  // Define columns using helpers
  const columns = useMemo<MRT_ColumnDef<any>[]>(() => [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "profile.user_email", header: "User Email" },
    { accessorKey: "full_address", header: "Full Address" },
    { accessorKey: "address_type", header: "Type", Cell: ({ cell }) => cell.getValue() === 'shipping' ? 'Shipping' : 'Billing' },
    { accessorKey: "label", header: "Label" },
    { accessorKey: "is_default", header: "Default", Cell: ({ cell }) => cell.getValue() ? "Yes" : "No" },
    createDateColumn("created_at", "Created"),
  ], [])

  return (
    <ListPage
      title="Addresses"
      description="Manage your shipping and billing addresses"
      addButtonText="Add Address"
      onAdd={() => navigate({ to: "/addresses/new" })}
    >
      <MaterialReactTable
        columns={columns}
        data={data?.results ?? []}
        state={{
          ...tableState,
          isLoading,
        }}
        manualPagination
        manualSorting
        manualFiltering
        enableGlobalFilter
        rowCount={data?.count ?? 0}
        enableRowActions
        renderRowActions={({ row }) => <RowActions row={row} actions={rowActions} />}
        positionActionsColumn="last"
        enablePagination
        enableSorting
        muiTableProps={{ sx: { minWidth: 650 } }}
        onPaginationChange={onPaginationChange}
        onSortingChange={onSortingChange}
        onColumnFiltersChange={onColumnFiltersChange}
        onGlobalFilterChange={onGlobalFilterChange}
        initialState={{ pagination: { pageIndex: 0, pageSize: 10 } }}
      />
    </ListPage>
  )
}

export const Route = createFileRoute('/_authenticated/addresses/')({
  component: AddressesPage,
}) 
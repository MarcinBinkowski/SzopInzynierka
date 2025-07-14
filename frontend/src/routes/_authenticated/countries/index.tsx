"use client"

import { useMemo } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table"
import { useGeographicCountriesList, useGeographicCountriesDestroy } from "@/api/generated/shop/geographic/geographic"
import { useServerSideTable } from "@/hooks/useServerSideTable"
import { ListPage } from "@/components/common/listPageHelpers/ListPage"
import { RowActions } from "@/components/common/listPageHelpers/RowActions"
import { createDateColumn } from "@/components/common/listPageHelpers/columnHelpers"
import { useStandardRowActions } from "@/components/common/listPageHelpers/useStandardRowActions"

function CountriesPage() {
  const navigate = useNavigate()

  // Use the generic table hook with automatic range filter handling
  const {
    tableState,
    apiParams,
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
  } = useServerSideTable({})

  const { data, isLoading, refetch } = useGeographicCountriesList(apiParams)
  const deleteMutation = useGeographicCountriesDestroy()

  // Use the standard row actions abstraction
  const rowActions = useStandardRowActions({
    editRoute: row => `/countries/${row.original?.id || row.id}/edit`,
    onDelete: async row => {
      await deleteMutation.mutateAsync({ id: row.original?.id || row.id })
      refetch()
    },
    deleteConfirmMessage: row => `Delete country "${row.original?.name || row.name}"?`,
    deleteSuccessMessage: "Country deleted"
  })

  // Define columns using helpers
  const columns = useMemo<MRT_ColumnDef<any>[]>(() => [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "code", header: "Code" },
    { accessorKey: "name", header: "Name" },
  ], [])

  return (
    <ListPage
      title="Countries"
      description="Manage countries"
      addButtonText="Add Country"
      onAdd={() => navigate({ to: "/countries/new" })}
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

export const Route = createFileRoute('/_authenticated/countries/')({
  component: CountriesPage,
}) 
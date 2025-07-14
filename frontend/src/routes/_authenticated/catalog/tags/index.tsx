"use client"

import { useMemo } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table"
import { useCatalogTagsList, useCatalogTagsDestroy } from "@/api/generated/shop/catalog/catalog"
import { useServerSideTable } from "@/hooks/useServerSideTable"
import { ListPage } from "@/components/common/listPageHelpers/ListPage"
import { RowActions } from "@/components/common/listPageHelpers/RowActions"
import { 
  createDateColumn
} from "@/components/common/listPageHelpers/columnHelpers"
import { useStandardRowActions } from "@/components/common/listPageHelpers/useStandardRowActions"

function TagsPage() {
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
    dateRangeFilterFields: ['created_at', 'updated_at'], // Date range filters
  })

  const { data, isLoading, refetch } = useCatalogTagsList(apiParams)
  const deleteMutation = useCatalogTagsDestroy()

  // Use the standard row actions abstraction
  const rowActions = useStandardRowActions({
    editRoute: row => `/catalog/tags/${row.original?.id || row.id}/edit`,
    onDelete: async row => {
      await deleteMutation.mutateAsync({ id: row.original?.id || row.id })
      refetch()
    },
    deleteConfirmMessage: row => `Delete tag "${row.original?.name || row.name}"?`,
    deleteSuccessMessage: "Tag deleted"
  })

  // Define columns using helpers
  const columns = useMemo<MRT_ColumnDef<any>[]>(() => [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "slug", header: "Slug" },
    createDateColumn("created_at", "Created"),
    createDateColumn("updated_at", "Updated"),
  ], [])

  return (
    <ListPage
      title="Tags"
      description="Manage your product tags"
      addButtonText="Add Tag"
      onAdd={() => navigate({ to: "/catalog/tags/new" })}
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

export const Route = createFileRoute('/_authenticated/catalog/tags/')({
  component: TagsPage,
}) 
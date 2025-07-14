"use client"

import { useMemo } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table"
import { useProfileProfilesList, useProfileProfilesDestroy } from "@/api/generated/shop/profile/profile"
import { useServerSideTable } from "@/hooks/useServerSideTable"
import { ListPage } from "@/components/common/listPageHelpers/ListPage"
import { RowActions } from "@/components/common/listPageHelpers/RowActions"
import { createDateColumn } from "@/components/common/listPageHelpers/columnHelpers"
import { useStandardRowActions } from "@/components/common/listPageHelpers/useStandardRowActions"

function ProfilesPage() {
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

  const { data, isLoading, refetch } = useProfileProfilesList(apiParams)
  const deleteMutation = useProfileProfilesDestroy()

  // Use the standard row actions abstraction
  const rowActions = useStandardRowActions({
    editRoute: row => `/profiles/${row.original?.id || row.id}/edit`,
    onDelete: async row => {
      await deleteMutation.mutateAsync({ id: row.original?.id || row.id })
      refetch()
    },
    deleteConfirmMessage: row => `Delete profile for "${row.original?.display_name || row.display_name}"?`,
    deleteSuccessMessage: "Profile deleted"
  })

  // Define columns using helpers
  const columns = useMemo<MRT_ColumnDef<any>[]>(() => [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "display_name", header: "Display Name" },
    { accessorKey: "user_email", header: "Email" },
    { accessorKey: "first_name", header: "First Name" },
    { accessorKey: "last_name", header: "Last Name" },
    { accessorKey: "profile_completed", header: "Completed", Cell: ({ cell }) => cell.getValue() ? "Yes" : "No" },
    createDateColumn("created_at", "Created"),
    createDateColumn("updated_at", "Updated"),
  ], [])

  return (
    <ListPage
      title="Profiles"
      description="Manage user profiles"
      addButtonText="Add Profile"
      onAdd={() => navigate({ to: "/profiles/new" })}
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

export const Route = createFileRoute('/_authenticated/profiles/')({
  component: ProfilesPage,
}) 
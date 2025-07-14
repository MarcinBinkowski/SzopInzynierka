"use client"

import { useMemo } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table"
import { useCatalogProductsList, useCatalogProductsDestroy } from "@/api/generated/shop/catalog/catalog"
import { useTheme } from '@mui/material/styles'
import { CategoryFilter } from "@/components/products/CategoryFilter"
import { useServerSideTable } from "@/hooks/useServerSideTable"
import { ListPage } from "@/components/common/listPageHelpers/ListPage"
import { RowActions } from "@/components/common/listPageHelpers/RowActions"
import { 
  createBooleanColumn, 
  createPriceColumn, 
  createDateColumn, 
  createTruncatedTextColumn,
  createPercentageColumn,
  createRangeFilterColumn
} from "@/components/common/listPageHelpers/columnHelpers"
import { useStandardRowActions } from "@/components/common/listPageHelpers/useStandardRowActions"

function ProductsPage() {
  const navigate = useNavigate()
  const theme = useTheme()

  // Use the generic table hook with automatic range filter handling
  const {
    tableState,
    apiParams,
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
  } = useServerSideTable({
    rangeFilterFields: ['stock_quantity', 'price'], // Number range filters
    dateRangeFilterFields: ['created_at'], // Date range filters
  })

  const { data, isLoading, refetch } = useCatalogProductsList(apiParams)
  const deleteMutation = useCatalogProductsDestroy()

  // Use the standard row actions abstraction
  const rowActions = useStandardRowActions({
    editRoute: row => `/catalog/products/${row.original?.id || row.id}/edit`,
    onDelete: async row => {
      await deleteMutation.mutateAsync({ id: row.original?.id || row.id })
      refetch()
    },
    deleteConfirmMessage: row => `Delete product "${row.original?.name || row.name}"?`,
    deleteSuccessMessage: "Product deleted"
  })

  // Define columns using helpers
  const columns = useMemo<MRT_ColumnDef<any>[]>(() => [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "slug", header: "Slug" },
    createTruncatedTextColumn("short_description", "Short Description", { maxLength: 80 }),
    createPriceColumn("price", "Price"),
    createPriceColumn("original_price", "Original Price"),
    createPriceColumn("current_price", "Current Price"),
    createPercentageColumn("discount_percentage", "Discount %"),
    { 
      accessorKey: "sku", 
      header: "SKU",
    },
    createRangeFilterColumn("price", "Price Range", {
      label: "Price Range",
      minPlaceholder: "Min Price",
      maxPlaceholder: "Max Price",
      min: 0,
      debounceMs: 300 // Faster response for price filtering
    }),
    createRangeFilterColumn("stock_quantity", "Stock", {
      label: "Stock Quantity Range",
      minPlaceholder: "Min",
      maxPlaceholder: "Max",
      min: 0,
      debounceMs: 500 // Default debounce for stock
    }),
    { 
      accessorKey: "status", 
      header: "Status",
      filterVariant: 'select',
      filterSelectOptions: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
        { text: 'Draft', value: 'draft' },
        { text: 'Out of Stock', value: 'out_of_stock' },
      ],
    },
    createBooleanColumn("is_visible", "Visible"),
    createBooleanColumn("is_on_sale", "On Sale"),
    createBooleanColumn("is_in_stock", "In Stock"),
    createBooleanColumn("is_available", "Available"),
    { 
      accessorKey: "category", 
      header: "Category", 
      Cell: ({ cell }) => {
        const cat = cell.getValue();
        return cat && typeof cat === 'object' && 'name' in cat ? (cat as { name?: string }).name ?? '' : '';
      },
      Filter: ({ column }) => <CategoryFilter column={column} />,
    },
    { 
      accessorKey: "primary_image", 
      header: "Image", 
      Cell: ({ cell }) => {
        const url = cell.getValue() as string | null | undefined;
        return url ? (
          <img 
            src={url} 
            alt="Product" 
            style={{ 
              width: 40, 
              height: 40, 
              objectFit: 'cover', 
              borderRadius: 4, 
              border: `1px solid ${theme.palette.divider}` 
            }} 
          />
        ) : null;
      } 
    },
    createDateColumn("created_at", "Created", {
    }),
  ], [theme])
  return (
    <ListPage
      title="Products"
      description="Manage your product catalog"
      addButtonText="Add Product"
      onAdd={() => navigate({ to: "/catalog/products/new" })}
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

export const Route = createFileRoute('/_authenticated/catalog/products/')({
  component: ProductsPage,
})
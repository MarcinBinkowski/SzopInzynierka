"use client"

import { useMemo } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { type MRT_ColumnDef } from "material-react-table"
import { useCatalogProductsList, useCatalogProductsDestroy } from "@/api/generated/shop/catalog/catalog"

import { CrudListPage } from "@/components/common/listPages"
import { 
  createDateColumn, 
  createBooleanColumn, 
  createPriceColumn, 
  createTruncatedTextColumn,
  createPercentageColumn,
  createImageColumn,
  createRelationColumn 
} from "@/components/common/listPageHelpers/columnHelpers"

function ProductsPage() {
  const navigate = useNavigate()
  const deleteMutation = useCatalogProductsDestroy()

  const columns = useMemo<MRT_ColumnDef<any>[]>(() => [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name", header: "Name" },
    createImageColumn("primary_image", "Image", { alt: "Product" }),
    { accessorKey: "sku", header: "SKU" },
    createTruncatedTextColumn("short_description", "Description", { maxLength: 50 }),
    createPriceColumn("price", "Price"),
    createPriceColumn("original_price", "Original Price"),
    createPriceColumn("current_price", "Current Price"),
    createPercentageColumn("discount_percentage", "Discount %"),
    { accessorKey: "stock_quantity", header: "Stock" },
    createBooleanColumn("is_active", "Active"),
    createBooleanColumn("is_featured", "Featured"),
    createBooleanColumn("is_visible", "Visible"),
    createRelationColumn("category", "Category", { nameField: "name", emptyText: "Uncategorized" }),
    createRelationColumn("manufacturer", "Manufacturer", { nameField: "name", emptyText: "No Manufacturer" }),
    createDateColumn("created_at", "Created"),
  ], [])

  const handleDelete = async (row: any) => {
    if (confirm(`Delete product "${row.name}"?`)) {
      await deleteMutation.mutateAsync({ id: row.id })
    }
  }

  return (
    <CrudListPage
      title="Products"
      columns={columns}
      useData={useCatalogProductsList}
      onAdd={() => navigate({ to: "/catalog/products/new" })}
      onEdit={(row) => navigate({ to: `/catalog/products/${row.id}/edit` })}
      onDelete={handleDelete}
    />
  )
}

export const Route = createFileRoute('/_authenticated/catalog/products/')({
  component: ProductsPage,
})
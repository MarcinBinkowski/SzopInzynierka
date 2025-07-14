import { useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type MRT_ColumnDef, MaterialReactTable } from "material-react-table";
import {
  useCatalogProductsList,
  useCatalogProductsDestroy,
} from "@/api/generated/shop/catalog/catalog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useServerSideTable } from "@/hooks/useServerSideTable";
import { extractDataFromResponse, getCountFromResponse } from "@/types/api";
import {
  createDateColumn,
  createBooleanColumn,
  createPriceColumn,
  createTruncatedTextColumn,
  createPercentageColumn,
  createImageColumn,
  createRelationColumn,
} from "@/components/common/listPageHelpers/columnHelpers";
import { useCanManageProducts } from "@/stores/authStore";
import { toast } from "sonner";

const toRange = (val: unknown): { min?: number; max?: number } => {
  if (Array.isArray(val)) {
    const [a, b] = val;
    const min = Number(a);
    const max = Number(b);
    return {
      min: Number.isFinite(min) ? min : undefined,
      max: Number.isFinite(max) ? max : undefined,
    };
  }
  if (val && typeof val === "object") {
    const { min, max } = val as { min?: unknown; max?: unknown };
    const nmin = Number(min);
    const nmax = Number(max);
    return {
      min: Number.isFinite(nmin) ? nmin : undefined,
      max: Number.isFinite(nmax) ? nmax : undefined,
    };
  }
  if (val !== undefined && val !== null && val !== "") {
    const n = Number(val as string);
    return { min: Number.isFinite(n) ? n : undefined };
  }
  return {};
};

function ProductsPage() {
  const navigate = useNavigate();
  const deleteMutation = useCatalogProductsDestroy({
    mutation: {
      onSuccess: (data) => {
        if (data && typeof data === 'object' && 'message' in data) {
          toast.info(`Product has been deactivated (hidden from catalog) due to existing orders.`);
        } else {
          toast.success(`Product has been deleted successfully.`);
        }
        refetch();
      },
    }
  });
  const canManageProducts = useCanManageProducts();

  const {
    tableState,
    apiParams,
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
  } = useServerSideTable({
    enablePagination: true,
    customParamBuilder: (params) => {
      const out: Record<string, unknown> = { ...params };

      const LIKE_MAP: Record<string, string> = {
        category: "category__name__icontains",
        manufacturer: "manufacturer__name__icontains",
        name: "name__icontains",
        sku: "sku__icontains",
        short_description: "short_description__icontains",
      };
      for (const [src, dst] of Object.entries(LIKE_MAP)) {
        if (out[src] != null && out[src] !== "") {
          out[dst] = out[src];
          delete out[src];
        }
      }

      (["original_price", "current_price"] as const).forEach((key) => {
        if (out[key] !== undefined) {
          const { min, max } = toRange(out[key]);
          if (min !== undefined) out[`${key}__gte`] = min;
          if (max !== undefined) out[`${key}__lte`] = max;
          delete out[key];
        }
      });

      return out;
    },
  });

  const { data: rawData, isLoading, refetch } = useCatalogProductsList(apiParams);

  const data = extractDataFromResponse(rawData || { results: [], count: 0 });
  const rowCount = getCountFromResponse(rawData || { results: [], count: 0 });

  const columns = useMemo<MRT_ColumnDef<any>[]>(() => [
    { accessorKey: "id", header: "ID", enableColumnFilter: true, filterVariant: "text" },
    { accessorKey: "name", header: "Name", enableColumnFilter: true, filterVariant: "text" },
    { ...createImageColumn("primary_image", "Image", { alt: "Product" }), enableColumnFilter: false, enableSorting: false },
    { accessorKey: "sku", header: "SKU", enableColumnFilter: true, filterVariant: "text" },
    { ...createTruncatedTextColumn("short_description", "Short Description", { maxLength: 150 }), enableColumnFilter: true, filterVariant: "text" },
    { ...createPriceColumn("original_price", "Original Price"), enableColumnFilter: true, filterVariant: "range", filterFn: "between", muiFilterTextFieldProps: { type: "number" } },
    { ...createPriceColumn("current_price", "Current Price"), enableColumnFilter: true, filterVariant: "range", filterFn: "between", muiFilterTextFieldProps: { type: "number" } },
    { ...createPercentageColumn("discount_percentage", "Discount %"), enableColumnFilter: false, enableSorting: false },
    { accessorKey: "stock_quantity", header: "Stock", enableColumnFilter: true, filterVariant: "text" },
    {
      ...createBooleanColumn("is_visible", "Visible"),
      enableColumnFilter: true,
      filterVariant: "select",
      filterSelectOptions: [
        { label: "All", value: "" },
        { label: "Yes", value: "true" },
        { label: "No", value: "false" },
      ],
    },
    {
      ...createRelationColumn("category", "Category", { nameField: "name", emptyText: "Uncategorized" }),
      enableColumnFilter: true,
      filterVariant: "text",
      filterFn: (row, _, filterValue) =>
        (row.original.category?.name || "Uncategorized")
          .toLowerCase()
          .includes(String(filterValue).toLowerCase()),
    },
    {
      ...createRelationColumn("manufacturer", "Manufacturer", { nameField: "name", emptyText: "No Manufacturer" }),
      enableColumnFilter: true,
      filterVariant: "text",
    },
    { ...createDateColumn("created_at", "Created"), enableColumnFilter: true, filterVariant: "text" },
  ], []);

  const handleDelete = (row: any) => {
    if (confirm(`Delete product "${row.name}"?`)) {
      deleteMutation.mutate({ id: row.id });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
        {canManageProducts && (
          <Button onClick={() => navigate({ to: "/catalog/products/new" })}>
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
        )}
      </div>

      <MaterialReactTable
        columns={columns}
        data={data as any[]}
        state={{ ...tableState, isLoading, showProgressBars: isLoading }}
        manualPagination
        manualSorting
        manualFiltering
        enablePagination
        enableSorting
        enableColumnFilters
        enableGlobalFilter
        globalFilterFn="contains"
        rowCount={rowCount}
        onPaginationChange={onPaginationChange}
        onSortingChange={onSortingChange}
        onColumnFiltersChange={onColumnFiltersChange}
        onGlobalFilterChange={onGlobalFilterChange}
        enableRowActions={canManageProducts}
        positionActionsColumn="last"
        getRowId={(row) => String(row.id)}
        renderRowActions={canManageProducts ? ({ row }) => (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate({ to: `/catalog/products/${row.original.id}/edit` })}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDelete(row.original)}
            >
              Delete
            </Button>
          </div>
        ) : undefined}
      />
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/catalog/products/")({
  component: ProductsPage,
});
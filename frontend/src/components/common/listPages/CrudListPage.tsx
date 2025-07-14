"use client";

import {
  type MRT_ColumnDef,
  type MRT_RowData,
  MaterialReactTable,
} from "material-react-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useServerSideTable } from "@/hooks/useServerSideTable";
import { extractDataFromResponse, getCountFromResponse } from "@/types/api";
import {
  useCanCreate,
  useIsAdmin,
  useCanCreateShipments,
  useCanManageOrders,
  useCanManageOrderNotes,
} from "@/stores/authStore";

interface CrudListPageProps<T extends MRT_RowData> {
  title: string;
  columns: MRT_ColumnDef<T>[];
  useData: (params: any) => { data: any; isLoading: boolean; refetch?: () => void };
  onAdd?: () => void;
  onEdit: (row: T) => void;
  onDelete?: (row: T) => void;
  enablePagination?: boolean;
  entityType?: "general" | "shipment" | "order" | "order-note";
}

export function CrudListPage<T extends MRT_RowData & { id: string | number }>({
  title,
  columns,
  useData,
  onAdd,
  onEdit,
  onDelete,
  enablePagination = true,
  entityType = "general",
}: CrudListPageProps<T>) {
  const processedColumns = columns.map((column) => {
    if (column.accessorKey === "id") {
      return {
        ...column,
        enableColumnFilter: true,
        filterVariant: "text" as const,
      };
    } else {
      return {
        ...column,
        enableColumnFilter: false,
      };
    }
  });
  const {
    tableState,
    apiParams,
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
  } = useServerSideTable({ enablePagination });

  const { data: rawData, isLoading, refetch } = useData(apiParams);

  const data = extractDataFromResponse(rawData);
  const rowCount = enablePagination
    ? getCountFromResponse(rawData)
    : data.length;

  const canCreate = useCanCreate();
  const canCreateShipments = useCanCreateShipments();
  const canManageOrders = useCanManageOrders();
  const canManageOrderNotes = useCanManageOrderNotes();
  const isAdmin = useIsAdmin();

  const canAdd =
    onAdd &&
    (entityType === "shipment"
      ? canCreateShipments
      : entityType === "order"
        ? canManageOrders
        : entityType === "order-note"
          ? canManageOrderNotes
          : canCreate);

  const canEdit =
    entityType === "shipment"
      ? canCreateShipments
      : entityType === "order"
        ? canManageOrders
        : entityType === "order-note"
          ? canManageOrderNotes
          : canCreate;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{title}</h1>
        {canAdd && (
          <Button onClick={onAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
        )}
      </div>
      <MaterialReactTable<T>
        columns={processedColumns}
        data={data as T[]}
        state={{
          ...tableState,
          isLoading,
          showProgressBars: isLoading,
        }}
        manualPagination={enablePagination}
        manualSorting={true}
        manualFiltering={true}
        enablePagination={enablePagination}
        enableSorting={true}
        enableColumnFilters={true}
        enableGlobalFilter={true}
        rowCount={rowCount}
        onPaginationChange={onPaginationChange}
        onSortingChange={onSortingChange}
        onColumnFiltersChange={onColumnFiltersChange}
        onGlobalFilterChange={onGlobalFilterChange}
        enableRowActions
        positionActionsColumn="last"
        renderRowActions={({ row }) => (
          <div className="flex gap-2">
            {canEdit && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(row.original)}
              >
                Edit
              </Button>
            )}
            {onDelete && isAdmin && (
              <Button
                size="sm"
                variant="destructive"
                onClick={async () => {
                  await onDelete(row.original);
                  if (refetch) {
                    refetch();
                  }
                }}
              >
                Delete
              </Button>
            )}
          </div>
        )}
      />
    </div>
  );
}

"use client";

import { type MRT_ColumnDef, type MRT_RowData, MaterialReactTable } from "material-react-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useServerSideTable } from "@/hooks/useServerSideTable";
import { extractDataFromResponse, getCountFromResponse } from "@/types/api";

interface CrudListPageProps<T extends MRT_RowData> {
  title: string;
  columns: MRT_ColumnDef<T>[];
  useData: (params: any) => { data: any; isLoading: boolean };
  onAdd: () => void;
  onEdit: (row: T) => void;
  onDelete?: (row: T) => void;
  enablePagination?: boolean;
}

export function CrudListPage<T extends MRT_RowData & { id: string | number }>({
  title,
  columns,
  useData,
  onAdd,
  onEdit,
  onDelete,
  enablePagination = true,
}: CrudListPageProps<T>) {
  const { tableState, apiParams, onPaginationChange, onSortingChange, onColumnFiltersChange, onGlobalFilterChange } = 
    useServerSideTable({ enablePagination });

  const { data: rawData, isLoading } = useData(apiParams);
  
  const data = extractDataFromResponse(rawData);
  const rowCount = enablePagination ? getCountFromResponse(rawData) : data.length;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{title}</h1>
        <Button onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add
        </Button>
      </div>

      {/* Table */}
      <MaterialReactTable<T>
        columns={columns}
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
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(row.original)}
            >
              Edit
            </Button>
            {onDelete && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(row.original)}
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

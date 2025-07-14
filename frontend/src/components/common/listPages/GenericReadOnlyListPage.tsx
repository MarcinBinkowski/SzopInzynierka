"use client";

import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_RowData,
  type MRT_TableOptions,
} from "material-react-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { RowActions } from "@/components/common/listPageHelpers/RowActions";
import { useServerSideTable } from "@/hooks/useServerSideTable";

export type Paginated<T> = { results: T[]; count?: number };
export type ListHookResult<T> = {
  data: T[] | Paginated<T> | undefined;
  isLoading: boolean;
  refetch: () => void;
};
export type UseListHook<T, Q = any> = (params: {
  query: Q;
}) => ListHookResult<T>;

export interface GenericReadOnlyListPageProps<T extends MRT_RowData, Q = any> {
  title: string;
  description?: string;
  columns: MRT_ColumnDef<T>[];

  useListHook: UseListHook<T, Q>;

  enablePagination?: boolean;

  customRowActions?: (row: T) => Array<{
    label: string;
    onClick: (row: T) => void;
    variant?: "default" | "destructive" | "outline";
  }>;

  onBack?: () => void;
  backButtonText?: string;
  backButtonRoute?: string;

  enableSorting?: boolean;
  enableColumnFilters?: boolean;
  enableGlobalFilter?: boolean;

  additionalTableProps?: Partial<MRT_TableOptions<T>>;
}

export function GenericReadOnlyListPage<T extends MRT_RowData, Q = any>({
  title,
  description,
  columns,
  useListHook,
  enablePagination = true,
  customRowActions,
  onBack,
  backButtonText = "Back",
  backButtonRoute,
  enableSorting = true,
  enableColumnFilters = true,
  enableGlobalFilter = true,
  additionalTableProps = {},
}: GenericReadOnlyListPageProps<T, Q>) {
  const navigate = useNavigate();

  const {
    tableState,
    apiParams,
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
  } = useServerSideTable({
    enablePagination,
  });

  const { data, isLoading, refetch } = useListHook({ query: apiParams as Q });

  const items: T[] = Array.isArray(data)
    ? (data as T[])
    : ((data as Paginated<T>)?.results ?? []);
  const rowCount = enablePagination
    ? Array.isArray(data)
      ? (data as T[]).length
      : ((data as Paginated<T>)?.count ?? items.length)
    : items.length;

  const handleBack = () => {
    if (onBack) return onBack();
    if (backButtonRoute) navigate({ to: backButtonRoute });
  };

  if (data === undefined && !isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {(onBack || backButtonRoute) && (
                <Button onClick={handleBack} variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {backButtonText}
                </Button>
              )}
              <Button onClick={refetch}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const baseTableProps: Partial<MRT_TableOptions<T>> = {
    columns,
    data: items,
    state: {
      ...tableState,
      isLoading,
      showProgressBars: isLoading,
    },
    manualFiltering: true,
    manualSorting: true,
    enableSorting,
    enableColumnFilters,
    enableGlobalFilter,
    enableRowActions: !!customRowActions,
    renderRowActions: ({ row }) => {
      if (!customRowActions) return null;
      const actions = customRowActions(row.original as T);
      return <RowActions row={row} actions={actions} />;
    },
    positionActionsColumn: "last",
    muiTableProps: { sx: { tableLayout: "fixed" } },
    onSortingChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
  };

  const paginationProps: Partial<MRT_TableOptions<T>> = enablePagination
    ? {
        manualPagination: true,
        enablePagination: true,
        onPaginationChange,
        rowCount,
        initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
      }
    : { enablePagination: false };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {(onBack || backButtonRoute) && (
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backButtonText}
          </Button>
        )}
      </div>

      <MaterialReactTable<T>
        {...(baseTableProps as MRT_TableOptions<T>)}
        {...(paginationProps as MRT_TableOptions<T>)}
        {...(additionalTableProps as MRT_TableOptions<T>)}
      />
    </div>
  );
}

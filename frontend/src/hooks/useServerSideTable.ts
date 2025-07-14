import { useState, useMemo, useCallback } from "react";
import type {
  MRT_SortingState,
  MRT_ColumnFiltersState,
  MRT_PaginationState,
} from "material-react-table";

type Updater<T> = T | ((old: T) => T);

type ParamRecord = Record<string, unknown>;

interface UseServerSideTableOptions<Q extends ParamRecord = ParamRecord> {
  initialPageSize?: number;
  defaultSorting?: MRT_SortingState;
  enablePagination?: boolean;

  paramNames?: {
    page?: string;
    pageSize?: string;
    ordering?: string;
    search?: string;
  };

  buildSortParam?: (sorting: MRT_SortingState) => string | undefined;

  customParamBuilder?: (params: ParamRecord) => Q;
}

export function useServerSideTable<Q extends ParamRecord = ParamRecord>(
  options: UseServerSideTableOptions<Q> = {},
) {
  const {
    initialPageSize = 10,
    defaultSorting = [],
    enablePagination = true,
    paramNames = {},
    buildSortParam = (sorting) =>
      sorting.length
        ? sorting.map((s) => (s.desc ? `-${s.id}` : s.id)).join(",")
        : undefined,
    customParamBuilder,
  } = options;

  const [tableState, setTableState] = useState<{
    pagination: MRT_PaginationState;
    sorting: MRT_SortingState;
    columnFilters: MRT_ColumnFiltersState;
    globalFilter: string;
  }>({
    pagination: { pageIndex: 0, pageSize: initialPageSize },
    sorting: defaultSorting,
    columnFilters: [],
    globalFilter: "",
  });

  const apiParams = useMemo(() => {
    let p: ParamRecord = {};
    const pageKey = paramNames.page ?? "page";
    const pageSizeKey = paramNames.pageSize ?? "page_size";
    const orderingKey = paramNames.ordering ?? "ordering";
    const searchKey = paramNames.search ?? "search";

    if (enablePagination) {
      p[pageKey] = tableState.pagination.pageIndex + 1;
      p[pageSizeKey] = tableState.pagination.pageSize;
    }

    const ordering = buildSortParam(tableState.sorting);
    if (ordering) p[orderingKey] = ordering;

    if (tableState.globalFilter) p[searchKey] = tableState.globalFilter;

    for (const f of tableState.columnFilters) {
      if (
        f?.id &&
        f.value !== undefined &&
        f.value !== null &&
        f.value !== ""
      ) {
        p[f.id] = f.value;
      }
    }

    if (customParamBuilder) p = customParamBuilder(p) as ParamRecord;

    return p as Q;
  }, [
    tableState,
    enablePagination,
    paramNames.page,
    paramNames.pageSize,
    paramNames.ordering,
    paramNames.search,
    buildSortParam,
    customParamBuilder,
  ]);

  const onPaginationChange = useCallback(
    (updater: Updater<MRT_PaginationState>) => {
      setTableState((prev) => ({
        ...prev,
        pagination:
          typeof updater === "function"
            ? (updater as any)(prev.pagination)
            : updater,
      }));
    },
    [],
  );

  const onSortingChange = useCallback((updater: Updater<MRT_SortingState>) => {
    setTableState((prev) => ({
      ...prev,
      sorting:
        typeof updater === "function"
          ? (updater as any)(prev.sorting)
          : updater,
    }));
  }, []);

  const onColumnFiltersChange = useCallback(
    (updater: Updater<MRT_ColumnFiltersState>) => {
      setTableState((prev) => ({
        ...prev,
        columnFilters:
          typeof updater === "function"
            ? (updater as any)(prev.columnFilters)
            : updater,
      }));
    },
    [],
  );

  const onGlobalFilterChange = useCallback((value: string) => {
    setTableState((prev) => ({ ...prev, globalFilter: value }));
  }, []);

  const resetTableState = useCallback(() => {
    setTableState({
      pagination: { pageIndex: 0, pageSize: initialPageSize },
      sorting: defaultSorting,
      columnFilters: [],
      globalFilter: "",
    });
  }, [defaultSorting, initialPageSize]);

  return {
    tableState,
    apiParams,
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
    resetTableState,
  };
}

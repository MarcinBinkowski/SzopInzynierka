import { useState, useMemo, useCallback } from "react";
import type {
  MRT_SortingState,
  MRT_ColumnFiltersState,
  MRT_PaginationState,
} from "material-react-table";

// Small helper like TanStack's Updater<T>
type Updater<T> = T | ((old: T) => T);

type ParamRecord = Record<string, unknown>;

interface UseServerSideTableOptions<Q extends ParamRecord = ParamRecord> {
  initialPageSize?: number;
  defaultSorting?: MRT_SortingState;
  enablePagination?: boolean;

  /** Map param keys if your API uses different names */
  paramNames?: {
    page?: string;          // default: "page"
    pageSize?: string;      // default: "page_size"
    ordering?: string;      // default: "ordering"
    search?: string;        // default: "search"
  };

  /**
   * Build ordering param from sorting array.
   * Default: join multi-sort as "col1,-col2"
   */
  buildSortParam?: (sorting: MRT_SortingState) => string | undefined;

  /** Fields whose value is an object { gte?: number; lte?: number } */
  rangeFilterFields?: string[];

  /** Fields whose value is an object { gte?: string|Date; lte?: string|Date } */
  dateRangeFilterFields?: string[];

  /** Last-mile param transform (e.g., add extra fixed filters) */
  customParamBuilder?: (params: ParamRecord) => Q;
}

export function useServerSideTable<Q extends ParamRecord = ParamRecord>(
  options: UseServerSideTableOptions<Q> = {}
) {
  const {
    initialPageSize = 10,
    defaultSorting = [],
    enablePagination = true,
    paramNames = {},
    buildSortParam = (sorting) =>
      sorting.length
        ? sorting
            .map((s) => (s.desc ? `-${s.id}` : s.id))
            .join(",")
        : undefined,
    rangeFilterFields = [],
    dateRangeFilterFields = [],
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

  const handleRangeFilters = useCallback((params: ParamRecord) => {
    // Numeric ranges: { price: { gte?: number; lte?: number } } -> price__gte, price__lte
    for (const field of rangeFilterFields) {
      const v = params[field] as any;
      if (v && typeof v === "object") {
        if (v.gte !== undefined) params[`${field}__gte`] = v.gte;
        if (v.lte !== undefined) params[`${field}__lte`] = v.lte;
        delete params[field];
      }
    }
    // Date ranges: { created_at: { gte?: string|Date; lte?: string|Date } } -> created_at__date__gte/lte
    const toISO = (d: unknown) =>
      d instanceof Date ? d.toISOString() : (d as string | undefined);

    for (const field of dateRangeFilterFields) {
      const v = params[field] as any;
      if (v && typeof v === "object") {
        if (v.gte !== undefined) params[`${field}__date__gte`] = toISO(v.gte);
        if (v.lte !== undefined) params[`${field}__date__lte`] = toISO(v.lte);
        delete params[field];
      }
    }
    return params;
  }, [rangeFilterFields, dateRangeFilterFields]);

  const apiParams = useMemo(() => {
    const p: ParamRecord = {};
    const pageKey = paramNames.page ?? "page";
    const pageSizeKey = paramNames.pageSize ?? "page_size";
    const orderingKey = paramNames.ordering ?? "ordering";
    const searchKey = paramNames.search ?? "search";

    // pagination
    if (enablePagination) {
      p[pageKey] = tableState.pagination.pageIndex + 1;
      p[pageSizeKey] = tableState.pagination.pageSize;
    }

    // sorting (multi-sort by default)
    const ordering = buildSortParam(tableState.sorting);
    if (ordering) p[orderingKey] = ordering;

    // global search
    if (tableState.globalFilter) p[searchKey] = tableState.globalFilter;

    // column filters
    for (const f of tableState.columnFilters) {
      if (f?.id && f.value !== undefined && f.value !== null && f.value !== "") {
        p[f.id] = f.value;
      }
    }

    // range + date ranges
    let out = handleRangeFilters(p);

    // last-mile mapping
    if (customParamBuilder) out = customParamBuilder(out) as ParamRecord;

    return out as unknown as Q;
  }, [
    tableState,
    enablePagination,
    paramNames.page,
    paramNames.pageSize,
    paramNames.ordering,
    paramNames.search,
    buildSortParam,
    handleRangeFilters,
    customParamBuilder,
  ]);

  const onPaginationChange = useCallback(
    (updater: Updater<MRT_PaginationState>) => {
      setTableState((prev) => ({
        ...prev,
        pagination:
          typeof updater === "function" ? (updater as any)(prev.pagination) : updater,
      }));
    },
    []
  );

  const onSortingChange = useCallback(
    (updater: Updater<MRT_SortingState>) => {
      setTableState((prev) => ({
        ...prev,
        sorting:
          typeof updater === "function" ? (updater as any)(prev.sorting) : updater,
      }));
    },
    []
  );

  const onColumnFiltersChange = useCallback(
    (updater: Updater<MRT_ColumnFiltersState>) => {
      setTableState((prev) => ({
        ...prev,
        columnFilters:
          typeof updater === "function" ? (updater as any)(prev.columnFilters) : updater,
      }));
    },
    []
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
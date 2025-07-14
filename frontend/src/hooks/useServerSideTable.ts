import { useState, useMemo, useCallback } from 'react'
import type { MRT_SortingState } from 'material-react-table'

interface UseServerSideTableOptions {
  initialPageSize?: number
  defaultSorting?: MRT_SortingState
  customParamBuilder?: (params: any) => any
  rangeFilterFields?: string[] // e.g., ['stock_quantity', 'price', 'created_at']
  dateRangeFilterFields?: string[] // e.g., ['created_at', 'updated_at']
}

export function useServerSideTable(options: UseServerSideTableOptions = {}) {
  const {
    initialPageSize = 10,
    defaultSorting = [],
    customParamBuilder
  } = options

  // Table state
  const [tableState, setTableState] = useState({
    pagination: { pageIndex: 0, pageSize: initialPageSize },
    sorting: defaultSorting,
    columnFilters: [],
    globalFilter: '',
  })

  // Reusable range filter handler
  const handleRangeFilters = useCallback((params: any) => {
    const { rangeFilterFields = [], dateRangeFilterFields = [] } = options

    // Handle number range filters (__gte, __lte)
    rangeFilterFields.forEach(fieldName => {
      if (params[fieldName] && typeof params[fieldName] === 'object' && params[fieldName] !== null) {
        const { [`${fieldName}__gte`]: gte, [`${fieldName}__lte`]: lte } = params[fieldName]
        if (gte !== undefined) params[`${fieldName}__gte`] = gte
        if (lte !== undefined) params[`${fieldName}__lte`] = lte
        delete params[fieldName]
      }
    })

    // Handle date range filters (__date__gte, __date__lte)
    dateRangeFilterFields.forEach(fieldName => {
      if (params[fieldName] && typeof params[fieldName] === 'object' && params[fieldName] !== null) {
        const { [`${fieldName}__date__gte`]: dateGte, [`${fieldName}__date__lte`]: dateLte } = params[fieldName]
        if (dateGte !== undefined) params[`${fieldName}__date__gte`] = dateGte
        if (dateLte !== undefined) params[`${fieldName}__date__lte`] = dateLte
        delete params[fieldName]
      }
    })

    return params
  }, [options.rangeFilterFields, options.dateRangeFilterFields])

  // Build API parameters
  const apiParams = useMemo(() => {
    const params: any = {
      page: tableState.pagination.pageIndex + 1,
      page_size: tableState.pagination.pageSize,
    }

    // Add sorting
    if (tableState.sorting.length > 0) {
      const sort = tableState.sorting[0]
      params.ordering = sort.desc ? `-${sort.id}` : sort.id
    }

    // Add global search
    if (tableState.globalFilter) {
      params.search = tableState.globalFilter
    }

    // Add column filters
    tableState.columnFilters.forEach((filter: any) => {
      if (filter.value !== undefined && filter.value !== null && filter.value !== '') {
        params[filter.id] = filter.value
      }
    })

    // Handle range filters automatically
    let processedParams = handleRangeFilters(params)

    // Apply custom param builder if provided
    if (customParamBuilder) {
      processedParams = customParamBuilder(processedParams)
    }

    return processedParams
  }, [tableState, handleRangeFilters, customParamBuilder])

  const onPaginationChange = useCallback(
    (updater: any) => {
      setTableState(prev => ({
        ...prev,
        pagination: typeof updater === 'function' ? updater(prev.pagination) : updater,
      }))
    },
    []
  )

  const onSortingChange = useCallback(
    (updater: any) => {
      setTableState(prev => ({
        ...prev,
        sorting: typeof updater === 'function' ? updater(prev.sorting) : updater,
      }))
    },
    []
  )

  const onColumnFiltersChange = useCallback(
    (updater: any) => {
      setTableState(prev => ({
        ...prev,
        columnFilters: typeof updater === 'function' ? updater(prev.columnFilters) : updater,
      }))
    },
    []
  )

  const onGlobalFilterChange = useCallback(
    (value: string) => {
      setTableState(prev => ({
        ...prev,
        globalFilter: value,
      }))
    },
    []
  )

  return {
    tableState,
    apiParams,
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
  }
} 
import type { MRT_ColumnDef } from 'material-react-table'
import { RangeFilter } from './filters/RangeFilter'
import { DateRangeFilter } from './filters/DateRangeFilter'

// Boolean column helper
export function createBooleanColumn(
  accessorKey: string,
  header: string,
  options?: {
    trueText?: string
    falseText?: string
  }
): MRT_ColumnDef<any> {
  const { trueText = "Yes", falseText = "No" } = options || {}
  
  return {
    accessorKey,
    header,
    Cell: ({ cell }) => {
      const value = cell.getValue()
      return value ? trueText : falseText
    }
  }
}

// Price column helper
export function createPriceColumn(
  accessorKey: string,
  header: string,
  options?: {
    currency?: string
  }
): MRT_ColumnDef<any> {
  const { currency = "$"} = options || {}
  
  return {
    accessorKey,
    header,
    Cell: ({ cell }) => {
      const value = cell.getValue()
      if (!value) return "N/A"
      return `${currency}${parseFloat(value as string).toFixed(2)}`
    }
  }
}

// Date column helper
export function createDateColumn(
  accessorKey: string,
  header: string,
  options: {
    enableSorting?: boolean
  } = {}
): MRT_ColumnDef<any> {
  return {
    accessorKey,
    header,
    enableSorting: options.enableSorting ?? true,
    Cell: ({ cell }) => {
      const date = cell.getValue()
      if (!date || typeof date !== "string") return "N/A"
      
      const parsed = Date.parse(date)
      if (isNaN(parsed)) return "N/A"
      
      const dateObj = new Date(parsed)
      
      // Always show yyyy-mm-dd format
      const year = dateObj.getFullYear()
      const month = String(dateObj.getMonth() + 1).padStart(2, '0')
      const day = String(dateObj.getDate()).padStart(2, '0')
      
      return `${year}-${month}-${day}`
    }
  }
}

export function createTruncatedTextColumn(
  accessorKey: string,
  header: string,
  options?: {
    maxLength?: number
    emptyText?: string
  }
): MRT_ColumnDef<any> {
  const { maxLength = 80, emptyText = "" } = options || {}
  
  return {
    accessorKey,
    header,
    Cell: ({ cell }) => {
      const value = cell.getValue()
      if (!value) return emptyText
      const text = String(value)
      return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text
    }
  }
}

// Percentage column helper
export function createPercentageColumn(
  accessorKey: string,
  header: string,

): MRT_ColumnDef<any> {
  
  return {
    accessorKey,
    header,
    Cell: ({ cell }) => {
      const value = cell.getValue()
      if (!value) return ""
      return `${value}$%`
    }
  }
}

export const createRangeFilterColumn = (
  accessorKey: string,
  header: string,
  options: {
    fieldName?: string
    label?: string
    minPlaceholder?: string
    maxPlaceholder?: string
    min?: number
    max?: number
    debounceMs?: number
  } = {}
) => ({
  accessorKey: `${accessorKey}_filter`,
  header,
  Filter: ({ column }: { column: any }) => (
    <RangeFilter
      column={column}
      fieldName={options.fieldName || accessorKey}
      label={options.label}
      minPlaceholder={options.minPlaceholder}
      maxPlaceholder={options.maxPlaceholder}
      min={options.min}
      max={options.max}
      debounceMs={options.debounceMs}
    />
  ),
})

export const createDateRangeFilterColumn = (
  accessorKey: string,
  header: string,
  options: {
    fieldName?: string
    label?: string
    fromPlaceholder?: string
    toPlaceholder?: string
    debounceMs?: number
  } = {}
) => ({
  accessorKey: `${accessorKey}_filter`,
  header,
  Filter: ({ column }: { column: any }) => (
    <DateRangeFilter
      column={column}
      fieldName={options.fieldName || accessorKey}
      label={options.label}
      fromPlaceholder={options.fromPlaceholder}
      toPlaceholder={options.toPlaceholder}
      debounceMs={options.debounceMs}
    />
  ),
}) 
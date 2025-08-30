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
      return `${value}%`
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

// Status column helper - capitalizes first letter
export function createStatusColumn(
  accessorKey: string,
  header: string,
  options?: {
    emptyText?: string
  }
): MRT_ColumnDef<any> {
  const { emptyText = "N/A" } = options || {}
  
  return {
    accessorKey,
    header,
    Cell: ({ cell }) => {
      const status = cell.getValue() as string
      return status ? status.charAt(0).toUpperCase() + status.slice(1) : emptyText
    }
  }
}

// Enum/choice column helper - maps values to display labels
export function createEnumColumn(
  accessorKey: string,
  header: string,
  enumMap: Record<string, string>,
  options?: {
    emptyText?: string
  }
): MRT_ColumnDef<any> {
  const { emptyText = "" } = options || {}
  
  return {
    accessorKey,
    header,
    Cell: ({ cell }) => {
      const value = cell.getValue() as string
      return value ? enumMap[value] || value : emptyText
    }
  }
}

// Select column helper - combines display with select filter
export function createSelectColumn(
  accessorKey: string,
  header: string,
  selectOptions: Array<{ text: string; value: string }>,
  options?: {
    emptyText?: string
  }
): MRT_ColumnDef<any> {
  const { emptyText = "" } = options || {}
  
  return {
    accessorKey,
    header,
    filterVariant: 'select' as const,
    filterSelectOptions: selectOptions,
    Cell: ({ cell }) => {
      const value = cell.getValue() as string
      if (!value) return emptyText
      
      const option = selectOptions.find(opt => opt.value === value)
      return option ? option.text : value
    }
  }
}

// Image column helper - displays images with consistent styling
export function createImageColumn(
  accessorKey: string,
  header: string,
  options?: {
    width?: number
    height?: number
    borderRadius?: number
    alt?: string
    fallback?: string | null
  }
): MRT_ColumnDef<any> {
  const { 
    width = 40, 
    height = 40, 
    borderRadius = 4, 
    alt = "Image",
    fallback = null 
  } = options || {}
  
  return {
    accessorKey,
    header,
    Cell: ({ cell }) => {
      const url = cell.getValue() as string | null | undefined
      
      if (!url) return fallback
      
      return (
        <img 
          src={url} 
          alt={alt}
          style={{ 
            width, 
            height, 
            objectFit: 'cover' as const,
            borderRadius,
            border: '1px solid #e0e0e0'
          }} 
        />
      )
    }
  }
}

// Relation column helper - displays name from related objects
export function createRelationColumn(
  accessorKey: string,
  header: string,
  options?: {
    nameField?: string
    emptyText?: string
  }
): MRT_ColumnDef<any> {
  const { nameField = "name", emptyText = "" } = options || {}
  
  return {
    accessorKey,
    header,
    Cell: ({ cell }) => {
      const obj = cell.getValue()
      
      if (!obj || typeof obj !== 'object') return emptyText
      
      const name = (obj as any)[nameField]
      return name || emptyText
    }
  }
}

// Number column helper - formats numbers with proper locale
export function createNumberColumn(
  accessorKey: string,
  header: string,
  options?: {
    decimals?: number
    locale?: string
    emptyText?: string
  }
): MRT_ColumnDef<any> {
  const { decimals = 0, locale = 'en-US', emptyText = "" } = options || {}
  
  return {
    accessorKey,
    header,
    Cell: ({ cell }) => {
      const value = cell.getValue()
      if (value === null || value === undefined || value === '') return emptyText
      
      const num = Number(value)
      if (isNaN(num)) return emptyText
      
      return num.toLocaleString(locale, { 
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals 
      })
    }
  }
}
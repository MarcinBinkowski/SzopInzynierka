import { Box, TextField, Typography } from '@mui/material'
import { useState, useEffect, useCallback } from 'react'

interface DateRangeFilterProps {
  column: any
  fieldName: string // e.g., 'created_at', 'updated_at'
  label?: string // e.g., 'Created Date Range', 'Updated Date Range'
  fromPlaceholder?: string
  toPlaceholder?: string
  debounceMs?: number
}

export const DateRangeFilter = ({ 
  column, 
  fieldName, 
  label, 
  fromPlaceholder = "From Date", 
  toPlaceholder = "To Date",
  debounceMs = 500
}: DateRangeFilterProps) => {
  const filterValue = column.getFilterValue() || {}
  const [fromDate, setFromDate] = useState<string>(filterValue[`${fieldName}__date__gte`] || '')
  const [toDate, setToDate] = useState<string>(filterValue[`${fieldName}__date__lte`] || '')

  // Sync local state with external filter value
  useEffect(() => {
    setFromDate(filterValue[`${fieldName}__date__gte`] || '')
    setToDate(filterValue[`${fieldName}__date__lte`] || '')
  }, [filterValue[`${fieldName}__date__gte`], filterValue[`${fieldName}__date__lte`]])

  // Debounced filter update
  const debouncedSetFilter = useCallback(
    debounce((newFilterValue: any) => {
      column.setFilterValue(newFilterValue)
    }, debounceMs),
    [column, debounceMs]
  )

  // Update filter when dates change
  useEffect(() => {
    const newFilterValue: any = {}
    
    if (fromDate) {
      newFilterValue[`${fieldName}__date__gte`] = fromDate
    }
    if (toDate) {
      newFilterValue[`${fieldName}__date__lte`] = toDate
    }

    // Only update if we have at least one date or if we're clearing the filter
    if (fromDate || toDate || Object.keys(filterValue).length > 0) {
      debouncedSetFilter(newFilterValue)
    }
  }, [fromDate, toDate, fieldName, debouncedSetFilter, filterValue])

  return (
    <Box sx={{ p: 1, minWidth: 200 }}>
      {label && (
        <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
          {label}
        </Typography>
      )}
      <TextField
        type="date"
        size="small"
        placeholder={fromPlaceholder}
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
        sx={{ mb: 1, width: '100%' }}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        type="date"
        size="small"
        placeholder={toPlaceholder}
        value={toDate}
        onChange={(e) => setToDate(e.target.value)}
        sx={{ width: '100%' }}
        InputLabelProps={{ shrink: true }}
      />
    </Box>
  )
}

// Simple debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
} 
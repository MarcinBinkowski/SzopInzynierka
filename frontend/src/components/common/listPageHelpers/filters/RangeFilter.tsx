import { Box, TextField, Typography } from '@mui/material'
import { useState, useEffect, useCallback } from 'react'

interface RangeFilterProps {
  column: any
  fieldName: string // e.g., 'stock_quantity', 'price', etc.
  label?: string // e.g., 'Stock Quantity Range', 'Price Range'
  minPlaceholder?: string
  maxPlaceholder?: string
  min?: number // minimum allowed value
  max?: number // maximum allowed value
  debounceMs?: number // debounce delay in milliseconds
}

export const RangeFilter = ({ 
  column, 
  fieldName, 
  label, 
  minPlaceholder = "Min", 
  maxPlaceholder = "Max",
  min,
  max,
  debounceMs = 500
}: RangeFilterProps) => {
  const filterValue = column.getFilterValue() || {}
  const [minValue, setMinValue] = useState<string>(filterValue[`${fieldName}__gte`]?.toString() || '')
  const [maxValue, setMaxValue] = useState<string>(filterValue[`${fieldName}__lte`]?.toString() || '')

  // Sync local state with external filter value
  useEffect(() => {
    setMinValue(filterValue[`${fieldName}__gte`]?.toString() || '')
    setMaxValue(filterValue[`${fieldName}__lte`]?.toString() || '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValue[`${fieldName}__gte`], filterValue[`${fieldName}__lte`]])

  // Debounced filter update function
  const debouncedSetFilter = useCallback(
    (newMinValue: string, newMaxValue: string) => {
      const timeoutId = setTimeout(() => {
        const newFilterValue: any = {}
        
        if (newMinValue && !isNaN(Number(newMinValue))) {
          newFilterValue[`${fieldName}__gte`] = Number(newMinValue)
        }
        if (newMaxValue && !isNaN(Number(newMaxValue))) {
          newFilterValue[`${fieldName}__lte`] = Number(newMaxValue)
        }
        
        // Only set filter if changed
        if (
          (newFilterValue[`${fieldName}__gte`] !== filterValue[`${fieldName}__gte`]) ||
          (newFilterValue[`${fieldName}__lte`] !== filterValue[`${fieldName}__lte`])
        ) {
          if (Object.keys(newFilterValue).length > 0) {
            column.setFilterValue(newFilterValue)
          } else {
            column.setFilterValue(undefined)
          }
        }
      }, debounceMs)

      return () => clearTimeout(timeoutId)
    },
    [fieldName, filterValue, column, debounceMs]
  )

  // Debounced effect for filter updates
  useEffect(() => {
    const cleanup = debouncedSetFilter(minValue, maxValue)
    return cleanup
  }, [minValue, maxValue, debouncedSetFilter])

  const displayLabel = label || `${fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Range`

  return (
    <Box sx={{ minWidth: 200, p: 1 }}>
      <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
        {displayLabel}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder={minPlaceholder}
          value={minValue}
          onChange={e => setMinValue(e.target.value)}
          type="number"
          inputProps={{ 
            min: min !== undefined ? min : undefined,
            max: max !== undefined ? max : undefined
          }}
          sx={{ width: '50%' }}
        />
        <Typography variant="caption">to</Typography>
        <TextField
          size="small"
          placeholder={maxPlaceholder}
          value={maxValue}
          onChange={e => setMaxValue(e.target.value)}
          type="number"
          inputProps={{ 
            min: min !== undefined ? min : undefined,
            max: max !== undefined ? max : undefined
          }}
          sx={{ width: '50%' }}
        />
      </Box>
    </Box>
  )
} 
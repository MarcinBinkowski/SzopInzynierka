import { useState, useEffect } from 'react'
import { useCatalogCategoriesList } from '@/api/generated/shop/catalog/catalog'
import { Box, FormControl, InputLabel, Select, MenuItem, Chip } from '@mui/material'

interface CategoryFilterProps {
  column: any
}

export const CategoryFilter = ({ column }: CategoryFilterProps) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  
  // Fetch categories from backend
  const { data: categoriesData } = useCatalogCategoriesList({}, {
    query: {
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    }
  })

  const categories = categoriesData?.results || []

  useEffect(() => {
    // Set initial filter value
    const filterValue = column.getFilterValue()
    if (filterValue) {
      setSelectedCategories(Array.isArray(filterValue) ? filterValue : [filterValue])
    }
  }, [column])

  const handleChange = (event: any) => {
    const value = event.target.value
    setSelectedCategories(typeof value === 'string' ? value.split(',') : value)
    
    // Apply filter to the table
    column.setFilterValue(value.length > 0 ? value : undefined)
  }

  return (
    <Box sx={{ minWidth: 200 }}>
      <FormControl fullWidth size="small">
        <InputLabel>Category</InputLabel>
        <Select
          multiple
          value={selectedCategories}
          onChange={handleChange}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => {
                const category = categories.find(cat => cat.id.toString() === value)
                return (
                  <Chip 
                    key={value} 
                    label={category?.name || value} 
                    size="small" 
                  />
                )
              })}
            </Box>
          )}
        >
          {categories.map((category) => (
            <MenuItem key={category.id} value={category.id.toString()}>
              {category.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  )
} 
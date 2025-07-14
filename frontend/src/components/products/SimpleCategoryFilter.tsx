import { useCatalogCategoriesList } from '@/api/generated/shop/catalog/catalog'
import { Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material'

interface SimpleCategoryFilterProps {
  column: any
}

export const SimpleCategoryFilter = ({ column }: SimpleCategoryFilterProps) => {
  const { data: categoriesData } = useCatalogCategoriesList({}, {
    query: {
      staleTime: 5 * 60 * 1000,
    }
  })

  const categories = categoriesData?.results || []
  const filterValue = column.getFilterValue()

  const handleChange = (event: any) => {
    const selectedId = event.target.value
    column.setFilterValue(selectedId || undefined)
  }

  return (
    <Box sx={{ minWidth: 200 }}>
      <FormControl fullWidth size="small">
        <InputLabel>Category</InputLabel>
        <Select
          value={filterValue || ""}
          onChange={handleChange}
        >
          <MenuItem value="">All categories</MenuItem>
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
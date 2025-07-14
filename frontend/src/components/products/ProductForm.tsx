"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/customui/form-field"
import { Spinner } from "@/components/customui/spinner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import type { ProductDetail } from '@/api/generated/shop/schemas'

import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { 
  useCatalogCategoriesList,
  useCatalogTagsList,
  useCatalogManufacturersList
} from "@/api/generated/shop/catalog/catalog"
import { 
  catalogProductsCreateBody, 
  catalogProductsPartialUpdateBody 
} from "@/api/generated/shop/catalog/catalog.zod"
import { SingleValue, MultiValue } from "react-select"
import { catalogCategoriesList, catalogTagsList, catalogManufacturersList } from "@/api/generated/shop/catalog/catalog";
import { AsyncPaginateSelect, OptionType } from "@/components/customui/AsyncPaginateSelect";

interface ProductFormProps {
  initialData?: Partial<ProductDetail>
  onSubmit: (data: any) => Promise<void>
  submitButtonText: string
  isSubmitting?: boolean
  onCancel: () => void
}

function isoToLocalDatetime(iso: string | null | undefined) {
  if (!iso) return '';
  // Remove seconds and Z/timezone
  return iso.slice(0, 16);
}

function localDatetimeToIso(local: string | null | undefined) {
  if (!local) return undefined;
  const date = new Date(local);
  return date.toISOString();
}

export function ProductForm({
  initialData,
  onSubmit,
  submitButtonText,
  isSubmitting: externalIsSubmitting,
  onCancel
}: ProductFormProps) {
  const schema = initialData?.id ? catalogProductsPartialUpdateBody : catalogProductsCreateBody
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: hookIsSubmitting },
    reset,
    setValue,
    watch
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      status: 'draft',
      is_visible: true,
      tag_ids: []
    }
  })

  const isSubmitting = externalIsSubmitting ?? hookIsSubmitting

  // Fetch categories, tags, and manufacturers
  const { data: categoriesData } = useCatalogCategoriesList(undefined)
  const { data: tagsData } = useCatalogTagsList(undefined)
  const { data: manufacturersData } = useCatalogManufacturersList(undefined)

  // Initialize form with initialData
  useEffect(() => {
    if (initialData && categoriesData?.results) {
      const categoryId = initialData.category?.id
      const manufacturerId = initialData.manufacturer?.id
      const tagIds = initialData.tags?.map(tag => tag.id) || []
      
      reset({
        name: initialData.name || '',
        slug: initialData.slug || '',
        description: initialData.description || '',
        short_description: initialData.short_description || '',
        price: initialData.price || '',
        original_price: initialData.original_price || '',
        sku: initialData.sku || '',
        stock_quantity: initialData.stock_quantity || 0,
        category_id: categoryId || undefined,
        manufacturer_id: manufacturerId || undefined,
        tag_ids: tagIds,
        status: initialData.status || 'draft',
        is_visible: initialData.is_visible ?? true,
        sale_start: isoToLocalDatetime(initialData.sale_start),
        sale_end: isoToLocalDatetime(initialData.sale_end)
      })
    }
  }, [initialData, reset, categoriesData?.results])

  const handleFormSubmit = async (data: any) => {
    // Convert local datetime to ISO string for Zod
    if (data.sale_start) data.sale_start = localDatetimeToIso(data.sale_start);
    if (data.sale_end) data.sale_end = localDatetimeToIso(data.sale_end);
    try {
      await onSubmit(data)
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Form submission failed: ${error.message}`)
      } else {
        toast.error("An unexpected error occurred")
      }
    }
  }

  const { data: defaultCategories } = useCatalogCategoriesList({ search: '', page: 1 });
  const defaultCategoryOptions = defaultCategories?.results?.map(cat => ({ value: cat.id, label: cat.name })) || [];
  const { data: defaultManufacturers } = useCatalogManufacturersList({ search: '', page: 1 });
  const defaultManufacturerOptions =  defaultManufacturers?.results?.map(man => ({ value: man.id, label: man.name })) || [];
  const { data: defaultTags } = useCatalogTagsList({ search: '', page: 1 });
  const defaultTagOptions = defaultTags?.results?.map(tag => ({ value: tag.id, label: tag.name })) || [];

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left/Main Column */}
        <div className="flex-1 space-y-6">
          {/* Product Information */}
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
              <p className="text-sm text-muted-foreground">Basic details about your product</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                label="Product Name"
                id="name"
                placeholder="Enter product name"
                register={register('name')}
                error={errors.name}
                disabled={isSubmitting}
                required
              />
              <FormField
                label="Description"
                id="description"
                placeholder="Enter product description"
                register={register('description')}
                error={errors.description}
                disabled={isSubmitting}
                required
                multiline
                rows={4}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category_id" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Category
                  </label>
                  <AsyncPaginateSelect
                    value={(() => {
                      const id = watch("category_id")
                      if (!id) return null
                      const cat = categoriesData?.results?.find((c: any) => c.id === id)
                      return cat ? { value: cat.id, label: cat.name } : null
                    })()}
                    onChange={(option: SingleValue<OptionType>) => setValue("category_id", option ? option.value : undefined)}
                    isDisabled={isSubmitting}
                    error={errors.category_id && String(errors.category_id.message)}
                    placeholder="Select category"
                    isMulti={false}
                    fetcher={catalogCategoriesList}
                    mapOption={cat => ({ value: cat.id, label: cat.name })}
                    defaultOptions={defaultCategoryOptions}
                    instanceId="category-async-paginate"
                  />
                </div>
                <div>
                  <label htmlFor="manufacturer_id" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Manufacturer
                  </label>
                  <AsyncPaginateSelect
                    value={(() => {
                      const id = watch("manufacturer_id")
                      if (!id) return null
                      const man = manufacturersData?.results?.find((m: any) => m.id === id)
                      return man ? { value: man.id, label: man.name } : null
                    })()}
                    onChange={(option: SingleValue<OptionType>) => setValue("manufacturer_id", option ? option.value : undefined)}
                    isDisabled={isSubmitting}
                    error={errors.manufacturer_id && String(errors.manufacturer_id.message)}
                    placeholder="Select manufacturer"
                    isMulti={false}
                    fetcher={catalogManufacturersList}
                    mapOption={man => ({ value: man.id, label: man.name })}
                    defaultOptions={defaultManufacturerOptions}
                    instanceId="manufacturer-async-paginate"
                  />
                </div>
              </div>
              {/* Tags Field */}
              <div className="mt-4">
                <label htmlFor="tag_ids" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Tags
                </label>
                <AsyncPaginateSelect
                  value={(() => {
                    const ids = watch("tag_ids")
                    if (!Array.isArray(ids)) return []
                    return ids.map((id: number) => {
                      const tag = tagsData?.results?.find((t: any) => t.id === id)
                      return tag ? { value: tag.id, label: tag.name } : { value: id, label: `Tag #${id}` }
                    })
                  })()}
                  onChange={(options: MultiValue<OptionType>) => setValue("tag_ids", Array.isArray(options) ? options.map(o => o.value) : [])}
                  isDisabled={isSubmitting}
                  error={errors.tag_ids && String(errors.tag_ids.message)}
                  placeholder="Add tags..."
                  isMulti
                  fetcher={catalogTagsList}
                  mapOption={tag => ({ value: tag.id, label: tag.name })}
                  defaultOptions={defaultTagOptions}
                  instanceId="tags-async-paginate"
                />
              </div>
            </CardContent>
          </Card>

          {/* Sale & Price */}
          <Card>
            <CardHeader>
              <CardTitle>Sale & Price</CardTitle>
              <p className="text-sm text-muted-foreground">Set the current sale price and schedule</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  label="Price ($)"
                  id="price"
                  placeholder="0.00"
                  register={register('price')}
                  error={errors.price}
                  disabled={isSubmitting}
                  required
                />
                <div>
                  <label htmlFor="sale_start" className="text-sm font-medium leading-none">Sale Start</label>
                  <input
                    id="sale_start"
                    type="datetime-local"
                    {...register('sale_start')}
                    className="block w-full border rounded-md px-3 py-2 mt-1"
                    disabled={isSubmitting}
                  />
                  {errors.sale_start && (
                    <p className="text-sm text-red-500">{String(errors.sale_start.message)}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="sale_end" className="text-sm font-medium leading-none">Sale End</label>
                  <input
                    id="sale_end"
                    type="datetime-local"
                    {...register('sale_end')}
                    className="block w-full border rounded-md px-3 py-2 mt-1"
                    disabled={isSubmitting}
                  />
                  {errors.sale_end && (
                    <p className="text-sm text-red-500">{String(errors.sale_end.message)}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Inventory */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Inventory</CardTitle>
              <p className="text-sm text-muted-foreground">Set original price and stock information</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  label="Original Price"
                  id="original_price"
                  placeholder="0.00"
                  register={register('original_price')}
                  error={errors.original_price}
                  disabled={isSubmitting}
                />
                <FormField
                  label="Stock Quantity"
                  id="stock_quantity"
                  placeholder="0"
                  register={register('stock_quantity', { valueAsNumber: true })}
                  error={errors.stock_quantity}
                  disabled={isSubmitting}
                  type="number"
                />
                <FormField
                  label="SKU"
                  id="sku"
                  placeholder="Enter SKU"
                  register={register('sku')}
                  error={errors.sku}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right/Sidebar Column */}
        <div className="flex flex-col gap-6 w-full lg:w-[340px] xl:w-[400px]">
          {/* Product Status */}
          <Card>
            <CardHeader>
              <CardTitle>Product Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Switch
                  checked={watch('is_visible')}
                  onCheckedChange={value => setValue('is_visible', value)}
                  disabled={isSubmitting}
                  id="is_visible"
                />
                <span className="font-medium">Active Product</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Inactive products won't be visible to customers
              </p>
            </CardContent>
          </Card>

          {/* Product Images */}
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <p className="text-sm text-muted-foreground">Upload product images</p>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-md flex flex-col items-center justify-center py-8 px-4 text-center text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-2" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v-4m0 0V8m0 4h4m-4 0H8m12 4v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4" /></svg>
                <Button type="button" variant="outline" disabled>Upload Images</Button>
                <div className="text-xs mt-2">PNG, JPG, GIF up to 10MB</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex justify-end gap-2 mt-8">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting && <Spinner className="mr-2 h-4 w-4" />}
          {submitButtonText}
        </Button>
      </div>
    </form>
  )
} 
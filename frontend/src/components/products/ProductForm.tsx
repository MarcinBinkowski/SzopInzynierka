"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/customui/FormField"
import { Spinner } from "@/components/customui/Spinner"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo } from "react"
import type { ProductDetail } from '@/api/generated/shop/schemas'
import { toast } from "sonner"
import { SwitchField } from "@/components/customui/SwitchField"
import { SlugField } from "@/components/customui/SlugField"
import { ProductImageUpload } from "./ProductImageUpload"
import {
  useCatalogCategoriesList,
  useCatalogTagsList,
  useCatalogManufacturersList,
  catalogTagsList,
} from "@/api/generated/shop/catalog/catalog"
import {
  catalogProductsCreateBody,
  catalogProductsPartialUpdateBody,
} from "@/api/generated/shop/catalog/catalog.zod"
import { z } from "zod"
import { MultiValue } from "react-select"
import { AsyncPaginateSelect, OptionType } from "@/components/customui/AsyncPaginateSelect"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type ProductCreateData = z.infer<typeof catalogProductsCreateBody>
type ProductUpdateData = z.infer<typeof catalogProductsPartialUpdateBody>
type ProductFormData = ProductCreateData | ProductUpdateData

interface ProductFormProps {
  initialData?: Partial<ProductDetail>
  onSubmit: (data: ProductFormData) => Promise<void>
  submitButtonText: string
  isSubmitting?: boolean
  onCancel: () => void
}

/** Convert ISO -> input value (YYYY-MM-DDTHH:MM). Empty for falsy/invalid. */
function isoToLocalInput(iso?: string | null) {
  if (!iso) return ""
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ""
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  const h = String(d.getHours()).padStart(2, "0")
  const min = String(d.getMinutes()).padStart(2, "0")
  return `${y}-${m}-${day}T${h}:${min}`
}

/** Convert input value (local datetime) -> ISO. Undefined for empty/invalid. */
function localInputToIso(local?: string | null) {
  if (!local) return undefined
  const d = new Date(local)
  return isNaN(d.getTime()) ? undefined : d.toISOString()
}

export function ProductForm({
  initialData,
  onSubmit,
  submitButtonText,
  isSubmitting: externalIsSubmitting,
  onCancel,
}: ProductFormProps) {
  const schema = useMemo(
    () => (initialData?.id ? catalogProductsPartialUpdateBody : catalogProductsCreateBody),
    [initialData?.id]
  )

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: hookIsSubmitting },
    reset,
    setValue,
    watch,
    control,
    trigger,
  } = useForm<ProductFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: "draft",
      is_visible: true,
      tag_ids: [],
      // keep dates undefined unless explicitly chosen
      sale_start: undefined,
      sale_end: undefined,
    },
    // important: keep our undefineds, don't coerce to ''
    shouldUseNativeValidation: false,
  })

  const isSubmitting = externalIsSubmitting ?? hookIsSubmitting

  const { data: categoriesData } = useCatalogCategoriesList({})
  const { data: tagsData } = useCatalogTagsList({})
  const { data: manufacturersData } = useCatalogManufacturersList({})

  // Initialize (store ISO in form state, not the input format)
  useEffect(() => {
    if (!initialData) return
    const categoryId = initialData.category?.id
    const manufacturerId = initialData.manufacturer?.id
    const tagIds = initialData.tags?.map(t => t.id) || []

    reset({
      name: initialData.name || "",
      slug: initialData.slug || "",
      description: initialData.description || "",
      short_description: initialData.short_description || "",
      price: initialData.price || "",
      original_price: initialData.original_price || "",
      sku: initialData.sku || "",
      stock_quantity: initialData.stock_quantity ?? 0,
      category_id: categoryId ?? undefined,
      manufacturer_id: manufacturerId ?? undefined,
      tag_ids: tagIds,
      status: initialData.status || "draft",
      is_visible: initialData.is_visible ?? true,
      // keep as ISO or undefined — Controller will render local string
      sale_start: initialData.sale_start ?? undefined,
      sale_end: initialData.sale_end ?? undefined,
    })
  }, [initialData, reset])

  const onValidSubmit = async (data: ProductFormData) => {
    try {
      // Values are already ISO/undefined; no extra conversion needed.
      await onSubmit(data)
    } catch (error) {
      toast.error(
        error instanceof Error ? `Form submission failed: ${error.message}` : "An unexpected error occurred"
      )
    }
  }

  const defaultTagOptions =
    tagsData?.results?.map(tag => ({ value: tag.id, label: tag.name })) || []

  return (
    <form onSubmit={handleSubmit(onValidSubmit)}>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
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
                register={register("name")}
                error={errors.name}
                disabled={isSubmitting}
                required
              />

              <SlugField
                register={register("slug")}
                watch={watch}
                setValue={setValue}
                trigger={trigger}
                sourceField="name"
                error={errors.slug}
                disabled={isSubmitting}
                required
              />

              <FormField
                label="Description"
                id="description"
                placeholder="Enter product description"
                register={register("description")}
                error={errors.description}
                disabled={isSubmitting}
                required
                multiline
                rows={4}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category_id" className="text-sm font-medium leading-none">Category</label>
                  <Select
                    value={watch("category_id") ? String(watch("category_id")) : ""}
                    onValueChange={(value) =>
                      setValue("category_id", value ? parseInt(value) : undefined)
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesData?.map((category) => (
                        <SelectItem key={category.id} value={String(category.id)}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category_id && (
                    <p className="text-sm text-red-500 mt-1">
                      {String(errors.category_id.message)}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="manufacturer_id" className="text-sm font-medium leading-none">Manufacturer</label>
                  <Select
                    value={watch("manufacturer_id") ? String(watch("manufacturer_id")) : ""}
                    onValueChange={(value) =>
                      setValue("manufacturer_id", value ? parseInt(value) : undefined)
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select manufacturer" />
                    </SelectTrigger>
                    <SelectContent>
                      {manufacturersData?.map((m) => (
                        <SelectItem key={m.id} value={String(m.id)}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.manufacturer_id && (
                    <p className="text-sm text-red-500 mt-1">
                      {String(errors.manufacturer_id.message)}
                    </p>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="mt-4">
                <label htmlFor="tag_ids" className="text-sm font-medium leading-none">Tags</label>
                <AsyncPaginateSelect
                  value={(() => {
                    const ids = watch("tag_ids")
                    if (!Array.isArray(ids)) return []
                    return ids.map((id: number) => {
                      const tag = tagsData?.results?.find(t => t.id === id)
                      return tag ? { value: tag.id, label: tag.name } : { value: id, label: `Tag #${id}` }
                    })
                  })()}
                  onChange={(options: MultiValue<OptionType>) =>
                    setValue(
                      "tag_ids",
                      Array.isArray(options) ? options.map(o => o.value) : []
                    )
                  }
                  isDisabled={isSubmitting}
                  error={errors.tag_ids && String(errors.tag_ids.message)}
                  placeholder="Add tags..."
                  isMulti
                  fetcher={catalogTagsList}
                  mapOption={(tag) => ({ value: tag.id, label: tag.name })}
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
                  register={register("price", { 
                    required: "Price is required",
                    min: { value: 0.01, message: "Price must be at least $0.01" }
                  })}
                  error={errors.price}
                  disabled={isSubmitting}
                  type="number"
                  required
                />

                {/* Sale Start (optional) */}
                <Controller
                  name="sale_start"
                  control={control}
                  render={({ field, fieldState }) => (
                    <div>
                      <label htmlFor="sale_start" className="text-sm font-medium leading-none">Sale Start</label>
                      <input
                        id="sale_start"
                        type="datetime-local"
                        value={isoToLocalInput(field.value as string | undefined)}
                        onChange={(e) => field.onChange(localInputToIso(e.target.value))}
                        className="block w-full border rounded-md px-3 py-2 mt-1"
                        disabled={isSubmitting}
                      />
                      {fieldState.error && (
                        <p className="text-sm text-red-500">{String(fieldState.error.message)}</p>
                      )}
                    </div>
                  )}
                />

                {/* Sale End (optional) */}
                <Controller
                  name="sale_end"
                  control={control}
                  render={({ field, fieldState }) => (
                    <div>
                      <label htmlFor="sale_end" className="text-sm font-medium leading-none">Sale End</label>
                      <input
                        id="sale_end"
                        type="datetime-local"
                        value={isoToLocalInput(field.value as string | undefined)}
                        onChange={(e) => field.onChange(localInputToIso(e.target.value))}
                        className="block w-full border rounded-md px-3 py-2 mt-1"
                        disabled={isSubmitting}
                      />
                      {fieldState.error && (
                        <p className="text-sm text-red-500">{String(fieldState.error.message)}</p>
                      )}
                    </div>
                  )}
                />
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
                  register={register("original_price", { 
                    required: "Original price is required",
                    min: { value: 0.01, message: "Original price must be at least $0.01" }
                  })}
                  error={errors.original_price}
                  disabled={isSubmitting}
                  type="number"
                  required
                />
                <FormField
                  label="Stock Quantity"
                  id="stock_quantity"
                  placeholder="0"
                  register={register("stock_quantity", { valueAsNumber: true })}
                  error={errors.stock_quantity}
                  disabled={isSubmitting}
                  type="number"
                />
                <FormField
                  label="SKU"
                  id="sku"
                  placeholder="Enter SKU"
                  register={register("sku")}
                  error={errors.sku}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6 w-full lg:w-[340px] xl:w-[400px]">
          <Card>
            <CardHeader>
              <CardTitle>Product Status</CardTitle>
            </CardHeader>
            <CardContent>
              <SwitchField
                id="is_visible"
                label="Active Product"
                description="Inactive products won't be visible to customers"
                checked={watch("is_visible") || false}
                onCheckedChange={(value) => setValue("is_visible", value)}
                disabled={isSubmitting}
              />
            </CardContent>
          </Card>

          {/* Only show image upload when editing existing product */}
          {initialData?.id && (
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
                <p className="text-sm text-muted-foreground">Upload product images</p>
              </CardHeader>
              <CardContent>
                <ProductImageUpload 
                  productId={initialData.id} 
                  disabled={isSubmitting}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 mt-8">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Spinner className="mr-2 h-4 w-4" />}
          {submitButtonText}
        </Button>
      </div>
    </form>
  )
}
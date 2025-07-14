import { FormField } from "@/components/common/FormField";
import { FormLayout } from "@/components/common/FormLayout";
import { FormSelect } from "@/components/common/FormSelect";
import { FormSubmitButton } from "@/components/common/FormSubmitButton";
import {
  AsyncPaginateSelect,
  type OptionType,
} from "@/components/common/AsyncPaginateSelect";
import { z } from "zod";
import type { ProductDelivery } from "@/api/generated/shop/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { isFieldRequired } from "@/utils/zod";
import {
  catalogDeliveriesCreateBody,
  catalogDeliveriesUpdateBody,
} from "@/api/generated/shop/catalog/catalog.zod";
import {
  catalogProductsList,
  useCatalogSuppliersList,
} from "@/api/generated/shop/catalog/catalog";
import type { SingleValue } from "react-select";

export type ProductDeliveryCreateData = z.infer<
  typeof catalogDeliveriesCreateBody
>;
export type ProductDeliveryUpdateData = z.infer<
  typeof catalogDeliveriesUpdateBody
>;
export type ProductDeliveryFormData =
  | ProductDeliveryCreateData
  | ProductDeliveryUpdateData;

interface ProductDeliveryFormProps {
  title: string;
  description: string;
  initialData?: ProductDelivery;
  onSubmit: (data: ProductDeliveryFormData) => Promise<void>;
  submitButtonText: string;
  isSubmitting?: boolean;
  onCancel: () => void;
}

export function ProductDeliveryForm({
  title,
  description,
  initialData,
  onSubmit,
  submitButtonText,
  isSubmitting,
  onCancel,
}: ProductDeliveryFormProps) {
  const isEditMode = !!initialData;
  const schema = isEditMode
    ? catalogDeliveriesUpdateBody
    : catalogDeliveriesCreateBody;

  const { data: suppliersData, isLoading: suppliersLoading } =
    useCatalogSuppliersList();

  const productsFetcher = async ({
    search,
    page,
  }: {
    search: string;
    page: number;
  }) => {
    const response = await catalogProductsList({
      search,
      page,
      page_size: 20,
    });
    return response;
  };

  const form = useForm<ProductDeliveryFormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData
      ? {
          supplier: (initialData as any).supplier,
          product: (initialData as any).product,
          quantity: initialData.quantity,
          delivery_date: initialData.delivery_date,
          cost_per_unit: initialData.cost_per_unit,
        }
      : undefined,
  });

  const [selectedProduct, setSelectedProduct] = useState<OptionType | null>(null);

  useEffect(() => {
    if (initialData && (initialData as any).product_name) {
      setSelectedProduct({
        value: (initialData as any).product,
        label: (initialData as any).product_name,
      });
    }
  }, [initialData]);

  const handleSubmit = form.handleSubmit(
    async (data: ProductDeliveryFormData) => {
      const transformed = {
        ...data,
        cost_per_unit: String((data as any).cost_per_unit ?? ""),
      } as ProductDeliveryFormData;
      await onSubmit(transformed);
    },
  );

  return (
    <FormLayout
      title={title}
      description={description}
      onCancel={onCancel}
      submitButtonText={submitButtonText}
      isSubmitting={isSubmitting}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelect
            label="Supplier"
            value={form.watch("supplier")}
            onValueChange={(value) => form.setValue("supplier", value as number)}
            options={suppliersData?.results?.map((supplier) => ({
              value: supplier.id,
              label: supplier.name,
            })) || []}
            disabled={form.formState.isSubmitting}
            isLoading={suppliersLoading}
            error={form.formState.errors.supplier?.message}
            schema={schema}
            fieldName="supplier"
            placeholder="Select a supplier"
          />

          <div className="space-y-2">
            <label htmlFor="product" className="text-sm font-medium">
              Product{" "}
              {isFieldRequired(schema, "product") && (
                <span className="text-red-500">*</span>
              )}
            </label>
            <AsyncPaginateSelect
              value={selectedProduct}
              onChange={(option: SingleValue<OptionType>) => {
                if (option) {
                  setSelectedProduct(option);
                  form.setValue("product", option.value);
                } else {
                  setSelectedProduct(null);
                }
              }}
              isDisabled={form.formState.isSubmitting}
              error={form.formState.errors.product?.message}
              placeholder="Select a product..."
              isMulti={false}
              fetcher={productsFetcher}
              mapOption={(product) => ({
                value: product.id,
                label: `${product.name} (${product.sku})`,
              })}
              defaultOptions={[]}
              instanceId="product-async-paginate"
            />
          </div>

          <FormField
            label="Quantity"
            id="quantity"
            type="number"
            register={form.register("quantity", {
              setValueAs: (v) =>
                v == null || v === "" ? undefined : Number(v),
            })}
            error={form.formState.errors.quantity}
            disabled={form.formState.isSubmitting}
            required={isFieldRequired(schema, "quantity")}
          />

          <FormField
            label="Delivery Date"
            id="delivery_date"
            type="datetime-local"
            register={form.register("delivery_date", {
              setValueAs: (v) => (v ? new Date(v).toISOString() : undefined),
            })}
            error={form.formState.errors.delivery_date}
            disabled={form.formState.isSubmitting}
            required={isFieldRequired(schema, "delivery_date")}
          />

          <FormField
            label="Cost per Unit"
            id="cost_per_unit"
            register={form.register("cost_per_unit", {
              setValueAs: (v) => (v == null ? "" : String(v)),
            })}
            error={form.formState.errors.cost_per_unit}
            disabled={form.formState.isSubmitting}
            required={isFieldRequired(schema, "cost_per_unit")}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <FormSubmitButton
            isSubmitting={isSubmitting}
            submitButtonText={submitButtonText}
          />
        </div>
      </form>
    </FormLayout>
  );
}

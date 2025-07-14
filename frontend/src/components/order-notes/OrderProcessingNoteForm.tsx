import { FormField } from "@/components/common/FormField";
import { FormSubmitButton } from "@/components/common/FormSubmitButton";
import { FormLayout } from "@/components/common/FormLayout";
import {
  AsyncPaginateSelect,
  type OptionType,
} from "@/components/common/AsyncPaginateSelect";
import { z } from "zod";
import type { OrderProcessingNote } from "@/api/generated/shop/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isFieldRequired } from "@/utils/zod";
import {
  checkoutOrderNotesCreateBody,
  checkoutOrderNotesUpdateBody,
} from "@/api/generated/shop/checkout/checkout.zod";
import { checkoutOrdersList } from "@/api/generated/shop/checkout/checkout";
import type { SingleValue } from "react-select";

export type OrderNoteCreateData = z.infer<typeof checkoutOrderNotesCreateBody>;
export type OrderNoteUpdateData = z.infer<typeof checkoutOrderNotesUpdateBody>;
export type OrderNoteFormData = OrderNoteCreateData | OrderNoteUpdateData;

interface OrderNoteFormProps {
  title: string;
  description: string;
  initialData?: OrderProcessingNote;
  onSubmit: (data: OrderNoteFormData) => Promise<void>;
  submitButtonText: string;
  isSubmitting?: boolean;
  onCancel: () => void;
}

export function OrderProcessingNoteForm({
  title,
  description,
  initialData,
  onSubmit,
  submitButtonText,
  isSubmitting,
  onCancel,
}: OrderNoteFormProps) {
  const isEditMode = !!initialData;
  const schema = isEditMode
    ? checkoutOrderNotesUpdateBody
    : checkoutOrderNotesCreateBody;

  const ordersFetcher = async ({
    search,
    page,
  }: {
    search: string;
    page: number;
  }) => {
    const response = await checkoutOrdersList({
      search: search.trim() || undefined,
      page,
      page_size: 20,
    });
    return response;
  };

  const form = useForm<OrderNoteFormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData
      ? {
          order: (initialData as any).order,
          note: (initialData as any).note,
        }
      : undefined,
  });

  const handleSubmit = form.handleSubmit(async (data: OrderNoteFormData) => {
    await onSubmit(data);
  });

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
          <div className="space-y-2">
            <label htmlFor="order" className="text-sm font-medium">
              Order{" "}
              {isFieldRequired(schema, "order") && (
                <span className="text-red-500">*</span>
              )}
            </label>
            <AsyncPaginateSelect
              value={(() => {
                const id = form.watch("order");
                if (!id) return null;
                if (initialData && (initialData as any).order_number) {
                  return {
                    value: id,
                    label: (initialData as any).order_number,
                  };
                }
                return { value: id, label: `Order #${id}` };
              })()}
              onChange={(option: SingleValue<OptionType>) => {
                if (option) {
                  form.setValue("order", option.value);
                }
              }}
              isDisabled={form.formState.isSubmitting}
              error={form.formState.errors.order?.message}
              placeholder="Select an order..."
              isMulti={false}
              fetcher={ordersFetcher}
              mapOption={(order) => ({
                value: order.id,
                label: `${order.order_number} - ${order.status}`,
              })}
              defaultOptions={[]}
              instanceId="order-async-paginate"
            />
          </div>

          <FormField
            label="Note"
            id="note"
            multiline
            rows={4}
            register={form.register("note")}
            error={form.formState.errors.note}
            disabled={form.formState.isSubmitting}
            required={isFieldRequired(schema, "note")}
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

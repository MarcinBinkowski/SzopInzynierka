import { useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type MRT_ColumnDef } from "material-react-table";
import {
  useCheckoutInvoiceTemplatesList,
  useCheckoutInvoiceTemplatesDestroy,
} from "@/api/generated/shop/checkout/checkout";
import { CrudListPage } from "@/components/common/listPages";
import {
  createDateColumn,
  createTruncatedTextColumn,
} from "@/components/common/listPageHelpers/columnHelpers";

function InvoiceTemplatesPage() {
  const navigate = useNavigate();
  const deleteMutation = useCheckoutInvoiceTemplatesDestroy();

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "name", header: "Name" },
      createTruncatedTextColumn("content", "Content", { maxLength: 100 }),
      { accessorKey: "created_by_name", header: "Created By" },
      createDateColumn("created_at", "Created"),
      createDateColumn("updated_at", "Updated"),
    ],
    [],
  );

  const handleDelete = async (row: any) => {
    if (confirm(`Delete template "${row.name}"?`)) {
      await deleteMutation.mutateAsync({ id: row.id });
    }
  };

  return (
    <CrudListPage
      title="Invoice Templates"
      columns={columns}
      useData={useCheckoutInvoiceTemplatesList}
      onAdd={() => navigate({ to: "/invoice-templates/new" })}
      onEdit={(row) => navigate({ to: `/invoice-templates/${row.id}/edit` })}
      onDelete={handleDelete}
      enablePagination={false}
    />
  );
}

export const Route = createFileRoute("/_authenticated/invoice-templates/")({
  component: InvoiceTemplatesPage,
});

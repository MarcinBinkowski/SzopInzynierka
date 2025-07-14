import { useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type MRT_ColumnDef } from "material-react-table";
import {
  useProfileAddressesList,
  useProfileAddressesDestroy,
} from "@/api/generated/shop/profile/profile";
import { CrudListPage } from "@/components/common/listPages";
import {
  createDateColumn,
  createBooleanColumn,
} from "@/components/common/listPageHelpers/columnHelpers";

function AddressesPage() {
  const navigate = useNavigate();
  const deleteMutation = useProfileAddressesDestroy();

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      { accessorKey: "id", header: "ID" },
      {
        accessorKey: "profile__user__email",
        header: "User Email",
        Cell: ({ row }) => row.original.profile?.user_email || "-",
      },
      {
        accessorKey: "address_line_1",
        header: "Address",
        Cell: ({ row }) => row.original.full_address || "-",
      },
      { accessorKey: "label", header: "Label" },
      createBooleanColumn("is_default", "Default"),
      createDateColumn("created_at", "Created"),
    ],
    [],
  );

  const handleDelete = async (row: any) => {
    if (confirm(`Delete address "${row.full_address}"?`)) {
      await deleteMutation.mutateAsync({ id: row.id });
    }
  };

  return (
    <CrudListPage
      title="Addresses"
      columns={columns}
      useData={useProfileAddressesList}
      onAdd={() => navigate({ to: "/addresses/new" })}
      onEdit={(row) => navigate({ to: `/addresses/${row.id}/edit` })}
      onDelete={handleDelete}
    />
  );
}

export const Route = createFileRoute("/_authenticated/addresses/")({
  component: AddressesPage,
});

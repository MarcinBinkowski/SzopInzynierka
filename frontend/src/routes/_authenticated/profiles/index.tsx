import { useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type MRT_ColumnDef } from "material-react-table";
import {
  useProfileProfilesList,
  useProfileProfilesDestroy,
} from "@/api/generated/shop/profile/profile";
import { CrudListPage } from "@/components/common/listPages";
import {
  createDateColumn,
  createBooleanColumn,
} from "@/components/common/listPageHelpers/columnHelpers";

function ProfilesPage() {
  const navigate = useNavigate();
  const deleteMutation = useProfileProfilesDestroy();

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      { accessorKey: "id", header: "ID" },
      {
        accessorKey: "user__email",
        header: "Email",
        Cell: ({ row }) => row.original.user_email || "-",
      },
      { accessorKey: "first_name", header: "First Name" },
      { accessorKey: "last_name", header: "Last Name" },
      createBooleanColumn("profile_completed", "Completed"),
      createDateColumn("created_at", "Created"),
      createDateColumn("updated_at", "Updated"),
    ],
    [],
  );

  const handleDelete = async (row: any) => {
    if (confirm(`Delete profile for "${row.display_name}"?`)) {
      await deleteMutation.mutateAsync({ id: row.id });
    }
  };

  return (
    <CrudListPage
      title="Profiles"
      columns={columns}
      useData={useProfileProfilesList}
      onEdit={(row) => navigate({ to: `/profiles/${row.id}/edit` })}
      onDelete={handleDelete}
    />
  );
}

export const Route = createFileRoute("/_authenticated/profiles/")({
  component: ProfilesPage,
});

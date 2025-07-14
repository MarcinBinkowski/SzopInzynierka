import { createFileRoute } from "@tanstack/react-router";
import { useCatalogNotificationsPreferencesList } from "@/api/generated/shop/catalog/catalog";
import type { NotificationPreference } from "@/api/generated/shop/schemas";
import { Badge } from "@/components/ui/badge";
import { createDateColumn } from "@/components/common/listPageHelpers/columnHelpers";
import type { MRT_ColumnDef } from "material-react-table";
import { MaterialReactTable } from "material-react-table";

const columns: MRT_ColumnDef<NotificationPreference>[] = [
  {
    accessorKey: "id",
    header: "ID",
    Cell: ({ cell }) => (
      <span className="font-mono text-sm">#{cell.getValue<number>()}</span>
    ),
  },
  {
    accessorKey: "stock_alerts_enabled",
    header: "Stock Alerts",
    Cell: ({ cell }) => {
      const enabled = Boolean(cell.getValue());
      console.log("Stock alerts value:", enabled, "Type:", typeof enabled);
      return (
        <Badge variant={enabled ? "default" : "secondary"}>
          {enabled ? "true" : "false"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "price_drop_alerts_enabled",
    header: "Price Drop Alerts",
    Cell: ({ cell }) => {
      const enabled = Boolean(cell.getValue());
      console.log("Price drop alerts value:", enabled, "Type:", typeof enabled);
      return (
        <Badge variant={enabled ? "default" : "secondary"}>
          {enabled ? "true" : "false"}
        </Badge>
      );
    },
  },
  createDateColumn("created_at", "Created"),
  createDateColumn("updated_at", "Last Updated"),
];

export const Route = createFileRoute(
  "/_authenticated/notifications/preferences/",
)({
  component: NotificationPreferencesPage,
});

function NotificationPreferencesPage() {
  const { data: preferencesData, isLoading } =
    useCatalogNotificationsPreferencesList();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notification Preferences</h1>
      </div>

      <MaterialReactTable<NotificationPreference>
        columns={columns}
        data={preferencesData || []}
        state={{
          isLoading,
          showProgressBars: isLoading,
        }}
        enablePagination={false}
        enableSorting={false}
        enableColumnFilters={false}
        enableGlobalFilter={false}
        muiTableBodyRowProps={({ row }) => ({
          onClick: () => {
            console.log("Row clicked:", row.original);
            console.log("Stock alerts:", row.original.stock_alerts_enabled);
            console.log(
              "Price drop alerts:",
              row.original.price_drop_alerts_enabled,
            );
          },
        })}
      />
    </div>
  );
}

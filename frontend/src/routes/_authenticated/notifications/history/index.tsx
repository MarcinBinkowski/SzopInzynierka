import { createFileRoute } from "@tanstack/react-router";
import { GenericReadOnlyListPage } from "@/components/common/listPages/GenericReadOnlyListPage";
import { useCatalogNotificationsHistoryList } from "@/api/generated/shop/notifications/notifications";
import type { NotificationHistory } from "@/api/generated/shop/schemas";
import { Badge } from "@/components/ui/badge";
import type { MRT_ColumnDef } from "material-react-table";

const columns: MRT_ColumnDef<NotificationHistory>[] = [
  {
    accessorKey: "created_at",
    header: "Created",
    Cell: ({ row }) => (
      <span className="font-medium">
        {new Date(row.original.created_at).toLocaleDateString()}
      </span>
    ),
  },
  {
    accessorKey: "notification_type",
    header: "Type",
    Cell: ({ cell }) => {
      const type = cell.getValue<string>();
      const variant =
        type === "stock_available"
          ? "default"
          : type === "price_drop"
            ? "secondary"
            : "outline";
      return <Badge variant={variant}>{type}</Badge>;
    },
  },
  {
    accessorKey: "product_name",
    header: "Product",
    Cell: ({ cell }) => (
      <span className="font-medium">{cell.getValue<string>() || "-"}</span>
    ),
  },
  {
    accessorKey: "title",
    header: "Title",
    Cell: ({ cell }) => (
      <span className="font-medium">{cell.getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "body",
    header: "Message",
    Cell: ({ cell }) => {
      const body = cell.getValue<string>();
      return body ? (
        <span title={body}>
          {body.length > 60 ? `${body.substring(0, 60)}...` : body}
        </span>
      ) : (
        "-"
      );
    },
  },
];

export const Route = createFileRoute("/_authenticated/notifications/history/")({
  component: NotificationHistoryPage,
});

function NotificationHistoryPage() {
  const useListHook = (params: any) => {
    const result = useCatalogNotificationsHistoryList(params?.query);
    return {
      data: result.data,
      isLoading: result.isLoading,
      refetch: result.refetch || (() => {}),
    };
  };

  return (
    <GenericReadOnlyListPage
      title="Notification History"
      columns={columns}
      useListHook={useListHook}
    />
  );
}

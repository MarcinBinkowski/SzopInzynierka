import { Button } from "@/components/ui/button";
import { MRT_Row, type MRT_RowData } from "material-react-table";

interface ActionItem<T extends MRT_RowData> {
  label: string;
  onClick: (row: T) => void;
  variant?: "default" | "destructive" | "outline";
}

interface RowActionsProps<T extends MRT_RowData> {
  row: MRT_Row<T>;
  actions: ActionItem<T>[];
}

export function RowActions<T extends MRT_RowData>({
  row,
  actions,
}: RowActionsProps<T>) {
  return (
    <div className="flex gap-2">
      {actions.map((action, index) => (
        <Button
          key={index}
          variant={action.variant || "default"}
          size="sm"
          onClick={() => action.onClick(row.original)}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}

import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"

interface UseStandardRowActionsProps {
  editRoute: (row: any) => string
  onDelete: (row: any) => Promise<void>
  deleteConfirmMessage?: (row: any) => string
  deleteSuccessMessage?: string
}

export function useStandardRowActions({
  editRoute,
  onDelete,
  deleteConfirmMessage = (row) => `Delete "${row.name}"?`,
  deleteSuccessMessage = "Deleted successfully"
}: UseStandardRowActionsProps) {
  const navigate = useNavigate()

  return [
    {
      label: "Edit",
      onClick: (row: any) => navigate({ to: editRoute(row) })
    },
    {
      label: "Delete",
      onClick: async (row: any) => {
        if (confirm(deleteConfirmMessage(row))) {
          await onDelete(row)
          toast.success(deleteSuccessMessage)
        }
      },
      variant: "destructive" as const
    }
  ]
} 
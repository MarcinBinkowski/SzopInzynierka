import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"

interface UseCrudRoutesProps<T> {
  basePath: string // e.g., "/catalog/categories"
  entityName: string // e.g., "category"
  useCreateHook: () => { mutateAsync: (data: any) => Promise<T> }
  useUpdateHook: () => { mutateAsync: (params: { id: number, data: any }) => Promise<T> }
  useRetrieveHook: (id: number) => { data: T | undefined, isLoading: boolean }
}

export function useCrudRoutes<T extends { id: number }>({
  basePath,
  entityName,
  useCreateHook,
  useUpdateHook,
  useRetrieveHook
}: UseCrudRoutesProps<T>) {
  const navigate = useNavigate()
  const createMutation = useCreateHook()
  const updateMutation = useUpdateHook()

  const handleCreate = async (data: any) => {
    try {
      await createMutation.mutateAsync(data)
      toast.success(`${entityName} created successfully`)
      navigate({ to: basePath, replace: true })
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to create ${entityName.toLowerCase()}: ${error.message}`)
      } else {
        toast.error(`Failed to create ${entityName.toLowerCase()}`)
      }
      throw error
    }
  }

  const handleUpdate = async (id: number, data: any) => {
    try {
      await updateMutation.mutateAsync({ id, data })
      toast.success(`${entityName} updated successfully`)
      navigate({ to: basePath, replace: true })
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to update ${entityName.toLowerCase()}: ${error.message}`)
      } else {
        toast.error(`Failed to update ${entityName.toLowerCase()}`)
      }
      throw error
    }
  }

  const handleCancel = () => {
    navigate({ to: basePath, replace: true })
  }

  const navigateToNew = () => {
    navigate({ to: `${basePath}/new` })
  }

  const navigateToEdit = (id: number) => {
    navigate({ to: `${basePath}/${id}/edit` })
  }

  return {
    handleCreate,
    handleUpdate,
    handleCancel,
    navigateToNew,
    navigateToEdit,
    useRetrieveHook,
    isCreating: (createMutation as any).isPending,
    isUpdating: (updateMutation as any).isPending
  }
}

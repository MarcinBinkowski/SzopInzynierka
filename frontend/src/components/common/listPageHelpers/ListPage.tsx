import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface ListPageProps {
  title: string
  description?: string
  addButtonText?: string
  onAdd?: () => void
  children: ReactNode
  headerActions?: ReactNode
}

export function ListPage({
  title,
  description,
  addButtonText = "Add New",
  onAdd,
  children,
  headerActions
}: ListPageProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {headerActions}
          {onAdd && (
            <Button onClick={onAdd}>
              <Plus className="mr-2 h-4 w-4" />
              {addButtonText}
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {children}
    </div>
  )
} 
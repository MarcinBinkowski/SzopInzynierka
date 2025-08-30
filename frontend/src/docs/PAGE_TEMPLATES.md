# Page Templates

These are standardized templates for creating new CRUD pages. Copy-paste and replace placeholders.

## New Page Template

```tsx
"use client"

import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEntityCreate } from "@/api/generated/MODULE/MODULE"
import { entityCreateBody } from "@/api/generated/MODULE/MODULE.zod"
import { EntityForm } from "@/components/entities/EntityForm"
import { toast } from "sonner"
import { z } from "zod"

// Use the generated Zod schema types
type EntityFormData = z.infer<typeof entityCreateBody>

function NewEntityPage() {
  const navigate = useNavigate()
  const createMutation = useEntityCreate()

  const handleSubmit = async (formData: EntityFormData) => {
    try {
      const validatedData = entityCreateBody.parse(formData)
      await createMutation.mutateAsync({ data: validatedData })
      toast.success("Entity created successfully")
      navigate({ to: "/entities" })
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to create entity: ${error.message}`)
      } else {
        toast.error("Failed to create entity")
      }
    }
  }

  const handleCancel = () => {
    navigate({ to: "/entities" })
  }

  return (
    <EntityForm
      title="Create New Entity"
      description="Add a new entity to the system"
      onSubmit={handleSubmit}
      submitButtonText="Create Entity"
      isSubmitting={createMutation.isPending}
      onCancel={handleCancel}
    />
  )
}

export const Route = createFileRoute('/_authenticated/entities/new')({
  component: NewEntityPage,
})
```

## Edit Page Template

```tsx
"use client"

import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router"
import { useEntityRetrieve, useEntityUpdate } from "@/api/generated/MODULE/MODULE"
import { entityUpdateBody } from "@/api/generated/MODULE/MODULE.zod"
import { EntityForm } from "@/components/entities/EntityForm"
import { Spinner } from "@/components/customui/spinner"
import { toast } from "sonner"
import { z } from "zod"

// Use the generated Zod schema types
type EntityFormData = z.infer<typeof entityUpdateBody>

function EditEntityPage() {
  const navigate = useNavigate()
  const { entityId } = useParams({ from: "/_authenticated/entities/$entityId/edit" })
  const updateMutation = useEntityUpdate()
  
  const { data: entity, isLoading, error } = useEntityRetrieve(Number(entityId))

  const handleSubmit = async (formData: EntityFormData) => {
    try {
      const validatedData = entityUpdateBody.parse(formData)
      await updateMutation.mutateAsync({ 
        id: Number(entityId), 
        data: validatedData 
      })
      toast.success("Entity updated successfully")
      navigate({ to: "/entities" })
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to update entity: ${error.message}`)
      } else {
        toast.error("Failed to update entity")
      }
    }
  }

  const handleCancel = () => {
    navigate({ to: "/entities" })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Spinner size="lg" />
          <span className="text-sm text-muted-foreground">Loading entity...</span>
        </div>
      </div>
    )
  }

  if (error || !entity) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-600">Failed to load entity</div>
      </div>
    )
  }

  return (
    <EntityForm
      title="Edit Entity"
      description="Update entity information"
      initialData={entity}
      onSubmit={handleSubmit}
      submitButtonText="Update Entity"
      isSubmitting={updateMutation.isPending}
      onCancel={handleCancel}
    />
  )
}

export const Route = createFileRoute('/_authenticated/entities/$entityId/edit')({
  component: EditEntityPage,
})
```

## List Page Template

```tsx
"use client"

import { useMemo } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { type MRT_ColumnDef } from "material-react-table"
import { useEntitiesList, useEntitiesDestroy } from "@/api/generated/MODULE/MODULE"
import { CrudListPage } from "@/components/common/listPages"
import { createDateColumn, createBooleanColumn } from "@/components/common/listPageHelpers/columnHelpers"

function EntitiesPage() {
  const navigate = useNavigate()
  const deleteMutation = useEntitiesDestroy()

  const columns = useMemo<MRT_ColumnDef<any>[]>(() => [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "slug", header: "Slug" },
    createBooleanColumn("is_active", "Active"),
    createDateColumn("created_at", "Created"),
  ], [])

  const handleDelete = async (row: any) => {
    if (confirm(`Delete entity "${row.name}"?`)) {
      await deleteMutation.mutateAsync({ id: row.id })
    }
  }

  return (
    <CrudListPage
      title="Entities"
      columns={columns}
      useData={useEntitiesList}
      onAdd={() => navigate({ to: "/entities/new" })}
      onEdit={(row) => navigate({ to: `/entities/${row.id}/edit` })}
      onDelete={handleDelete}
    />
  )
}

export const Route = createFileRoute('/_authenticated/entities/')({
  component: EntitiesPage,
})
```

## Common Column Patterns

### Basic Entity (name, slug, active, dates)
```tsx
const columns = useMemo<MRT_ColumnDef<any>[]>(() => [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "slug", header: "Slug" },
  createBooleanColumn("is_active", "Active"),
  createDateColumn("created_at", "Created"),
], [])
```

### Address Entity
```tsx
const columns = useMemo<MRT_ColumnDef<any>[]>(() => [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "profile.user_email", header: "User Email" },
  { accessorKey: "full_address", header: "Full Address" },
  { accessorKey: "label", header: "Label" },
  createBooleanColumn("is_default", "Default"),
  createDateColumn("created_at", "Created"),
], [])
```

### Profile Entity
```tsx
const columns = useMemo<MRT_ColumnDef<any>[]>(() => [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "display_name", header: "Display Name" },
  { accessorKey: "user_email", header: "Email" },
  { accessorKey: "first_name", header: "First Name" },
  { accessorKey: "last_name", header: "Last Name" },
  createBooleanColumn("profile_completed", "Completed"),
  createDateColumn("created_at", "Created"),
  createDateColumn("updated_at", "Updated"),
], [])
```

## Placeholders to Replace

When using templates, replace these placeholders:

- `Entity/entity` → Your entity name (e.g., `Tag/tag`, `Category/category`)
- `entities` → Plural entity name (e.g., `tags`, `categories`)
- `MODULE` → API module name (e.g., `catalog`, `geographic`, `profile`)
- `/entities` → Base path (e.g., `/catalog/tags`, `/countries`)
- Route paths → Update to match your entity structure

## Example Replacements

For a new "Brand" entity in catalog module:

- `Entity` → `Brand`
- `entity` → `brand`  
- `entities` → `brands`
- `MODULE` → `catalog`
- `/entities` → `/catalog/brands`
- `entityId` → `brandId`
- Route paths → `/_authenticated/catalog/brands/`

The patterns are consistent and predictable!

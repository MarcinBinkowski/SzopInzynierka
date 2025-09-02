import React from 'react'
import { useCanCreate, useIsAdmin, useCanManageOrders, useIsEmployee, useCanCreateShipments } from '@/stores/authStore'

interface SimpleRoleGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

// Simple guards using store selectors directly
export const AdminOnly: React.FC<SimpleRoleGuardProps> = ({ children, fallback = null }) => {
  const isAdmin = useIsAdmin()
  return isAdmin ? <>{children}</> : <>{fallback}</>
}

export const StaffOnly: React.FC<SimpleRoleGuardProps> = ({ children, fallback = null }) => {
  const canManageOrders = useCanManageOrders()
  return canManageOrders ? <>{children}</> : <>{fallback}</>
}

export const CreateOnly: React.FC<SimpleRoleGuardProps> = ({ children, fallback = null }) => {
  const canCreate = useCanCreate()
  return canCreate ? <>{children}</> : <>{fallback}</>
}

export const EmployeeOnly: React.FC<SimpleRoleGuardProps> = ({ children, fallback = null }) => {
  const isEmployee = useIsEmployee()
  return isEmployee ? <>{children}</> : <>{fallback}</>
}

// Compound component for conditional buttons
interface ConditionalButtonsProps {
  onEdit?: () => void
  onDelete?: () => void
  onCreate?: () => void
  entityType?: 'general' | 'order' | 'shipment'
}

export const ConditionalButtons: React.FC<ConditionalButtonsProps> = ({
  onEdit,
  onDelete,
  onCreate,
  entityType = 'general'
}) => {
  const canCreate = useCanCreate()
  const isAdmin = useIsAdmin()
  const canManageOrders = useCanManageOrders()
  const canCreateShipments = useCanCreateShipments()

  const showEdit = entityType === 'order' ? canManageOrders : 
                   entityType === 'shipment' ? canCreateShipments :
                   canCreate
  const showDelete = isAdmin
  const showCreate = entityType === 'order' ? canManageOrders :
                     entityType === 'shipment' ? canCreateShipments :
                     canCreate

  return (
    <div className="flex gap-2">
      {showCreate && onCreate && (
        <button onClick={onCreate} className="btn-primary">
          Create
        </button>
      )}
      {showEdit && onEdit && (
        <button onClick={onEdit} className="btn-secondary">
          Edit
        </button>
      )}
      {showDelete && onDelete && (
        <button onClick={onDelete} className="btn-danger">
          Delete
        </button>
      )}
    </div>
  )
}

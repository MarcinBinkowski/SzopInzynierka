import { API_BASE_URL, fetchOptions } from './config'
import type { StaffRole } from './types'

const API_URL = `${API_BASE_URL}/StaffRole`

export async function getStaffRoles() {
  try {
    const response = await fetch(API_URL)
    const data = await response.json()
    return data as StaffRole[]
  } catch (error) {
    console.error('Failed to fetch staff roles:', error)
    return []
  }
}

export async function getStaffRole(id: number) {
  try {
    const response = await fetch(`${API_URL}/${id}`)
    const data = await response.json()
    return data as StaffRole
  } catch (error) {
    console.error(`Failed to fetch staff role ${id}:`, error)
    throw error
  }
}

export async function createStaffRole(role: Omit<StaffRole, 'id'>) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      ...fetchOptions,
      body: JSON.stringify(role)
    })
    return await response.json() as StaffRole
  } catch (error) {
    console.error('Failed to create staff role:', error)
    throw error
  }
}

export async function updateStaffRole(role: StaffRole) {
  try {
    const response = await fetch(`${API_URL}/${role.id}`, {
      method: 'PUT',
      ...fetchOptions,
      body: JSON.stringify(role)
    })
    if (!response.ok) throw new Error('Failed to update staff role')
    return await response.json() as StaffRole
  } catch (error) {
    console.error('Failed to update staff role:', error)
    throw error
  }
}

export async function deleteStaffRole(id: number) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete staff role')
    return true
  } catch (error) {
    console.error('Failed to delete staff role:', error)
    throw error
  }
}

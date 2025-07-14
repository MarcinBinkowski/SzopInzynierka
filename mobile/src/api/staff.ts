import { API_BASE_URL, fetchOptions } from './config'
import type { Staff } from './types'

const API_URL = `${API_BASE_URL}/Staff`

export async function getStaff() {
  try {
    const response = await fetch(API_URL)
    const data = await response.json()
    return data as Staff[]
  } catch (error) {
    console.error('Failed to fetch staff:', error)
    return []
  }
}

export async function getStaffMember(id: number) {
  try {
    const response = await fetch(`${API_URL}/${id}`)
    const data = await response.json()
    return data as Staff
  } catch (error) {
    console.error(`Failed to fetch staff member ${id}:`, error)
    throw error
  }
}

export async function createStaffMember(staff: Omit<Staff, 'id'>) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      ...fetchOptions,
      body: JSON.stringify(staff)
    })
    return await response.json() as Staff
  } catch (error) {
    console.error('Failed to create staff member:', error)
    throw error
  }
}

export async function updateStaffMember(staff: Staff) {
  try {
    const response = await fetch(`${API_URL}/${staff.id}`, {
      method: 'PUT',
      ...fetchOptions,
      body: JSON.stringify(staff)
    })
    if (!response.ok) throw new Error('Failed to update staff member')
    return await response.json() as Staff
  } catch (error) {
    console.error('Failed to update staff member:', error)
    throw error
  }
}

export async function deleteStaffMember(id: number) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete staff member')
    return true
  } catch (error) {
    console.error('Failed to delete staff member:', error)
    throw error
  }
}

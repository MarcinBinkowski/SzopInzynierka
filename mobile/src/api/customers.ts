import { API_BASE_URL, fetchOptions } from './config'
import type { Customer } from './types'

const API_URL = `${API_BASE_URL}/Customer`

export async function getCustomers() {
  try {
    const response = await fetch(API_URL)
    const data = await response.json()
    return data as Customer[]
  } catch (error) {
    console.error('Failed to fetch customers:', error)
    return []
  }
}

export async function getCustomer(id: number) {
  try {
    const response = await fetch(`${API_URL}/${id}`)
    const data = await response.json()
    return data as Customer
  } catch (error) {
    console.error(`Failed to fetch customer ${id}:`, error)
    throw error
  }
}

export async function createCustomer(customer: Omit<Customer, 'id'>) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      ...fetchOptions,
      body: JSON.stringify(customer)
    })
    return await response.json() as Customer
  } catch (error) {
    console.error('Failed to create customer:', error)
    throw error
  }
}

export async function updateCustomer(customer: Customer) {
  try {
    const response = await fetch(`${API_URL}/${customer.id}`, {
      method: 'PUT',
      ...fetchOptions,
      body: JSON.stringify(customer)
    })
    if (!response.ok) throw new Error('Failed to update customer')
    return true
  } catch (error) {
    console.error('Failed to update customer:', error)
    throw error
  }
}

export async function deleteCustomer(id: number) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete customer')
    return true
  } catch (error) {
    console.error('Failed to delete customer:', error)
    throw error
  }
}

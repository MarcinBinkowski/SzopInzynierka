import { API_BASE_URL, fetchOptions } from './config'
import type { Ticket } from './types'

const API_URL = `${API_BASE_URL}/Ticket`

export async function getTickets() {
  try {
    const response = await fetch(API_URL)
    const data = await response.json()
    return data as Ticket[]
  } catch (error) {
    console.error('Failed to fetch tickets:', error)
    return []
  }
}

export async function getTicket(id: number) {
  try {
    const response = await fetch(`${API_URL}/${id}`)
    const data = await response.json()
    return data as Ticket
  } catch (error) {
    console.error(`Failed to fetch ticket ${id}:`, error)
    throw error
  }
}

export async function createTicket(ticket: Omit<Ticket, 'id'>) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      ...fetchOptions,
      body: JSON.stringify(ticket)
    })
    return await response.json() as Ticket
  } catch (error) {
    console.error('Failed to create ticket:', error)
    throw error
  }
}

export async function updateTicket(ticket: Ticket) {
  try {
    const response = await fetch(`${API_URL}/${ticket.id}`, {
      method: 'PUT',
      ...fetchOptions,
      body: JSON.stringify(ticket)
    })
    if (!response.ok) throw new Error('Failed to update ticket')
    return await response.json() as Ticket
  } catch (error) {
    console.error('Failed to update ticket:', error)
    throw error
  }
}

export async function deleteTicket(id: number) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete ticket')
    return true
  } catch (error) {
    console.error('Failed to delete ticket:', error)
    throw error
  }
}

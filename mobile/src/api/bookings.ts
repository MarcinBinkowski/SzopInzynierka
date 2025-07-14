import { API_BASE_URL, fetchOptions } from './config'
import type { Booking } from './types'

const API_URL = `${API_BASE_URL}/Booking`

export async function getBookings() {
  try {
    const response = await fetch(API_URL)
    const data = await response.json()
    return data as Booking[]
  } catch (error) {
    console.error('Failed to fetch bookings:', error)
    return []
  }
}

export async function getBooking(id: number) {
  try {
    const response = await fetch(`${API_URL}/${id}`)
    const data = await response.json()
    return data as Booking
  } catch (error) {
    console.error(`Failed to fetch booking ${id}:`, error)
    throw error
  }
}

export async function createBooking(booking: Omit<Booking, 'id'>) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      ...fetchOptions,
      body: JSON.stringify(booking)
    })
    return await response.json() as Booking
  } catch (error) {
    console.error('Failed to create booking:', error)
    throw error
  }
}

export async function updateBooking(booking: Booking) {
  try {
    const response = await fetch(`${API_URL}/${booking.id}`, {
      method: 'PUT',
      ...fetchOptions,
      body: JSON.stringify(booking)
    })
    if (!response.ok) throw new Error('Failed to update booking')
    return await response.json() as Booking
  } catch (error) {
    console.error('Failed to update booking:', error)
    throw error
  }
}

export async function deleteBooking(id: number) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete booking')
    return true
  } catch (error) {
    console.error('Failed to delete booking:', error)
    throw error
  }
}

import { API_BASE_URL, fetchOptions } from './config'
import type { ScreeningRoom } from './types'

const API_URL = `${API_BASE_URL}/ScreeningRoom`

export async function getScreeningRooms() {
  try {
    const response = await fetch(API_URL)
    const data = await response.json()
    return data as ScreeningRoom[]
  } catch (error) {
    console.error('Failed to fetch screening rooms:', error)
    return []
  }
}

export async function getScreeningRoom(id: number) {
  try {
    const response = await fetch(`${API_URL}/${id}`)
    const data = await response.json()
    return data as ScreeningRoom
  } catch (error) {
    console.error(`Failed to fetch screening room ${id}:`, error)
    throw error
  }
}

export async function createScreeningRoom(room: Omit<ScreeningRoom, 'id'>) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      ...fetchOptions,
      body: JSON.stringify({
        roomNumber: room.roomNumber,
        capacity: room.capacity,
      })
    })
    console.log('Response:', response.json)
    return await response.json() as ScreeningRoom
  } catch (error) {
    console.error('Failed to create screening room:', error)
    throw error
  }
}

export async function updateScreeningRoom(room: ScreeningRoom) {
  try {
    const response = await fetch(`${API_URL}/${room.id}`, {
      method: 'PUT',
      ...fetchOptions,
      body: JSON.stringify(room)
    })
    if (!response.ok) throw new Error('Failed to update screening room')
    return await response.json() as ScreeningRoom
  } catch (error) {
    console.error('Failed to update screening room:', error)
    throw error
  }
}

export async function deleteScreeningRoom(id: number) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete screening room')
    return true
  } catch (error) {
    console.error('Failed to delete screening room:', error)
    throw error
  }
}

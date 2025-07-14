import { formatDateForApi } from '#/utils/dateFormatters'
import { API_BASE_URL, fetchOptions } from './config'
import type { Movie } from './types'

const API_URL = `${API_BASE_URL}/Movie`

export async function getMovies() {
  try {
    const response = await fetch(API_URL)
    const data = await response.json()
    return data as Movie[]
  } catch (error) {
    console.error('Failed to fetch movies:', error)
    return []
  }
}

export async function getMovie(id: number) {
  try {
    const response = await fetch(`${API_URL}/${id}`)
    const data = await response.json()
    return data as Movie
  } catch (error) {
    console.error(`Failed to fetch movie ${id}:`, error)
    throw error
  }
}

export async function createMovie(movie: Omit<Movie, 'id'>) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      ...fetchOptions,
      body: JSON.stringify({
        title: movie.title,
        durationMinutes: movie.durationMinutes,
        releaseDate:    formatDateForApi(movie.releaseDate)
      })
    })
    return await response.json() as Movie
  } catch (error) {
    console.error('Failed to create movie:', error)
    throw error
  }
}

export async function updateMovie(movie: Movie) {
  try {
    const response = await fetch(`${API_URL}/${movie.id}`, {
      method: 'PUT',
      ...fetchOptions,
      body: JSON.stringify({
        id:            movie.id,
        title: movie.title,
        durationMinutes: movie.durationMinutes,
        releaseDate:    formatDateForApi(movie.releaseDate)
      })
    });

    if (!response.ok) {
      throw new Error('Failed to update movie');
    }

    return await response.json() as Movie;
  } catch (error) {
    console.error('Failed to update movie:', error);
    throw error;
  }
}

export async function deleteMovie(id: number) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete movie')
    return true
  } catch (error) {
    console.error('Failed to delete movie:', error)
    throw error
  }
}

import { formatDateTimeForApi } from '#/utils/dateFormatters';
import { API_BASE_URL, fetchOptions } from './config';
import type { Screening } from './types';

const API_URL = `${API_BASE_URL}/Screening`;

export async function getScreenings() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    return data as Screening[];
  } catch (error) {
    console.error('Failed to fetch screenings:', error);
    return [];
  }
}

export async function getScreening(id: number) {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    const data = await response.json();
    return data as Screening;
  } catch (error) {
    console.error(`Failed to fetch screening ${id}:`, error);
    throw error;
  }
}

export async function createScreening(screening: Omit<Screening, 'id'>) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      ...fetchOptions,
      body: JSON.stringify({
        movieId: screening.movieId,
        roomId: screening.roomId,
        screeningTime: formatDateTimeForApi(screening.screeningTime)
      })
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.log('Error data:', errorData);
      throw new Error(errorData.title || 'Failed to create screening');
    }

    return (await response.json()) as Screening;
  } catch (error) {
    console.error('Failed to create screening:', error);
    throw error;
  }
}

export async function updateScreening(screening: Screening) {
  try {
    const response = await fetch(`${API_URL}/${screening.id}`, {
      method: 'PUT',
      ...fetchOptions,
      body: JSON.stringify({
        id: screening.id,
        movieId: screening.movieId,
        roomId: screening.roomId,
        screeningTime: formatDateTimeForApi(screening.screeningTime)
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log('Error data:', errorData);
      throw new Error(errorData.title || 'Failed to update screening');
    }

    return (await response.json()) as Screening;
  } catch (error) {
    console.error('Failed to update screening:', error);
    throw error;
  }
}

export async function deleteScreening(id: number) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete screening');
    return true;
  } catch (error) {
    console.error('Failed to delete screening:', error);
    throw error;
  }
}

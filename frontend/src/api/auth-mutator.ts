import axios from 'axios';
import { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'sonner';

// const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
const BASE_URL = 'http://localhost:8000';

export const authClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Helper function to get CSRF token from cookie
const getCSRFToken = (): string | null => {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrftoken') {
      return decodeURIComponent(value);
    }
  }
  return null;
};

authClient.interceptors.request.use(
  async (config) => {
  const csrfToken = getCSRFToken();
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
});

authClient.interceptors.response.use(
  async (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401) {
      toast.error('Authentication required');
      window.location.href = '/login';
    } else if (status === 403) {
      toast.error('CSRF token missing or invalid');
    } else if (status === 422) {
      toast.error('Please check your input');
    }
    else {
      toast.error('Something went wrong');
    }
    return Promise.reject(error);
  }
);

export const authInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  return authClient(config).then(({ data }) => data);
};

export type ErrorType<Error> = AxiosResponse<Error>;
export type BodyType<BodyData> = BodyData;
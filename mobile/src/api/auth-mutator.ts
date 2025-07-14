import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';
import { router } from 'expo-router';

const BASE_URL = 'http://localhost:8000';

const authClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

authClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);

authClient.interceptors.response.use(
  async (response) => {
    const data = response.data as any;
    if (data?.meta?.access_token) {
      await SecureStore.setItemAsync('access_token', data.meta.access_token);
    }
    return response;
  }
);

authClient.interceptors.response.use(
  async (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('access_token');
      router.replace('/login');
    } else if (error.response?.status === 410) {
      await SecureStore.deleteItemAsync('access_token');
    } else if (error.response?.status === 409) {
      Alert.alert('Conflict - please try again');
    } else {
      Alert.alert('Something went wrong');
    }
    return Promise.reject(error);
  }
);
export const authInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  return authClient(config).then(({ data }) => data);
};

export type ErrorType<Error> = AxiosResponse<Error>;
export type BodyType<BodyData> = BodyData;
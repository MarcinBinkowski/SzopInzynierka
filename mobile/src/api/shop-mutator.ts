import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';
import { router } from 'expo-router';

const BASE_URL = 'http://localhost:8000';

const shopClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

shopClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('session_token');
    if (token) {
      config.headers["X-Session-Token"] = token;
    }
    return config;
  }
);

shopClient.interceptors.response.use( 
  async (response) => {
    const data = response.data as any;
    if (data?.meta?.session_token) {
      await SecureStore.setItemAsync('session_token', data.meta.session_token);
    }
    return response;
  }
);

shopClient.interceptors.response.use(
  async (response: AxiosResponse) => {
    console.log('✅ Shop API Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      method: response.config.method?.toUpperCase(),
      contentType: response.headers['content-type'],
      dataType: typeof response.data,
      dataSize: JSON.stringify(response.data).length,
      timestamp: new Date().toISOString(),
    })
    
    if (typeof response.data === 'string') {
      console.log('📄 Response Preview:', response.data.substring(0, 200) + '...')
    } else {
      console.log('📊 Response Data:', response.data)
    }
    
    return response
  },
  async (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401) {
      await SecureStore.deleteItemAsync('session_token');
      router.replace('/login');
      Alert.alert('Please re-authenticate to continue');
    } else if (status === 404) {
      Alert.alert('Resource not found');
    } else if (status === 403) {
      Alert.alert('You do not have permission to access this resource.');
    } else if (status === 410) {
      await SecureStore.deleteItemAsync('session_token');
      Alert.alert('Session expired');
    } else if (status === 409) {
      Alert.alert('Conflict - please try again');
    } else if (status && status >= 400 && status < 500) {
      const message =
        (error.response?.data as any)?.detail ||
        (error.response?.data as any)?.message ||
        'An error occurred';
      Alert.alert(message);
    } else {
      Alert.alert('Something went wrong');
    }
    return Promise.reject(error);
  }
);

export const shopInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  return shopClient(config).then(({ data }) => data);
};

export type ErrorType<Error> = AxiosResponse<Error>;
export type BodyType<BodyData> = BodyData;
import axios from "axios";
import { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";

const BASE_URL = "http://localhost:8000";

export const authClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

const getCSRFToken = (): string | null => {
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "csrftoken") {
      return decodeURIComponent(value);
    }
  }
  return null;
};

authClient.interceptors.request.use(async (config) => {
  const csrfToken = getCSRFToken();
  if (csrfToken) {
    config.headers["X-CSRFToken"] = csrfToken;
  }
  return config;
});

authClient.interceptors.response.use(
  async (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401) {
      console.log("401 error caught in auth-mutator:", error.config?.url);
      useAuthStore.getState().clearSession();
    } else if (status === 403) {
      toast.error("CSRF token missing or invalid");
    } else if (status === 422) {
      toast.error("Please check your input");
    } else if (status && status >= 400) {
      toast.error("Something went wrong");
    }
    return Promise.reject(error);
  },
);

export const authInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  return authClient(config).then(({ data }) => data);
};

export type ErrorType<Error> = AxiosResponse<Error>;
export type BodyType<BodyData> = BodyData;

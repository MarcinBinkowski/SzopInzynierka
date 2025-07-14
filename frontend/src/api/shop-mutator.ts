import axios from "axios";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";

export const shopClient = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
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

shopClient.interceptors.request.use((config) => {
  const csrfToken = getCSRFToken();
  if (csrfToken) {
    config.headers["X-CSRFToken"] = csrfToken;
  }
  return config;
});

shopClient.interceptors.response.use(
  async (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const status = error.response?.status;

    if (status === 401) {
      const { clearSession } = useAuthStore.getState();

      clearSession();

      toast.error("Your session has expired. Please log in again.");

      const currentPath = window.location.pathname;
      if (currentPath !== "/login") {
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    }

    if (status === 404) {
      toast.error("Resource not found");
    } else if (status === 403) {
      toast.error("You do not have permission to access this resource.");
    } else if (status >= 500) {
      const errorData = error.response?.data;
      if (errorData?.detail?.includes("Cannot delete") && errorData?.detail?.includes("foreign key")) {
        toast.error("Cannot delete this item because it's being used by other items.");
      } else {
        toast.error("Server error. Please try again later.");
      }
    } else if (status >= 400 && status < 500) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "An error occurred";
      toast.error(message);
    }

    return Promise.reject(error);
  },
);

export const shopInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  return shopClient(config).then(({ data }) => data);
};

export type ErrorType<Error> = AxiosResponse<Error>;
export type BodyType<BodyData> = BodyData;

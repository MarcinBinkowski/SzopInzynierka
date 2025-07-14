export interface PaginatedResponse<T> {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: T[];
}

export interface SimpleResponse<T> {
  data: T[];
}

export type ApiResponse<T> = PaginatedResponse<T> | T[] | SimpleResponse<T>;

export function isPaginatedResponse<T>(
  response: any,
): response is PaginatedResponse<T> {
  return (
    response &&
    typeof response === "object" &&
    "results" in response &&
    "count" in response
  );
}

export function isSimpleResponse<T>(
  response: any,
): response is SimpleResponse<T> {
  return (
    response &&
    typeof response === "object" &&
    "data" in response &&
    !("results" in response)
  );
}

export function extractDataFromResponse<T>(response: ApiResponse<T>): T[] {
  if (isPaginatedResponse(response)) {
    return response.results;
  }
  if (isSimpleResponse(response)) {
    return response.data;
  }
  if (Array.isArray(response)) {
    return response;
  }
  return [];
}

export function getCountFromResponse<T>(response: ApiResponse<T>): number {
  if (isPaginatedResponse(response)) {
    return response.count;
  }
  if (isSimpleResponse(response)) {
    return response.data.length;
  }
  if (Array.isArray(response)) {
    return response.length;
  }
  return 0;
}

export function getNextPageParam(
  nextUrl: string | null | undefined,
): number | undefined {
  if (!nextUrl) return undefined;
  const url = new URL(nextUrl);
  const page = url.searchParams.get("page");
  return page ? parseInt(page) : undefined;
}

export function createGetNextPageParam() {
  return (lastPage: { next?: string | null }) =>
    getNextPageParam(lastPage.next);
}

export function flattenPaginatedData(data: any): any[] {
  if (!data?.pages) return [];
  return data.pages.flatMap((page: any) => page.results || []);
}

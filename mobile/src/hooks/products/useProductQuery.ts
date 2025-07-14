import { useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { catalogProductsList } from "@/api/generated/shop/catalog/catalog";
import { createGetNextPageParam, flattenPaginatedData } from "@/lib/pagination";
import type { CatalogProductsListParams } from "@/api/generated/shop/schemas/catalogProductsListParams";

export interface ProductQueryFilters {
  searchQuery: string;
  selectedCategory: number | null;
  selectedTags: string[];
  ordering: string | null;
}

interface UseProductQueryOptions {
  filters: ProductQueryFilters;
  pageSize?: number;
}

export function useProductQuery({
  filters,
  pageSize = 10,
}: UseProductQueryOptions) {
  const { searchQuery, selectedCategory, selectedTags, ordering } = filters;

  const buildQueryParams = useCallback(
    (pageParam: number = 1): CatalogProductsListParams => {
      const params: CatalogProductsListParams = {
        page: pageParam,
        page_size: pageSize,
      };

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      if (selectedCategory) {
        params.category = selectedCategory;
      }

      if (selectedTags.length > 0) {
        params.tags = selectedTags.join(",");
      }

      if (ordering) {
        params.ordering = ordering;
      }

      return params;
    },
    [searchQuery, selectedCategory, selectedTags, ordering, pageSize],
  );

  const query = useInfiniteQuery({
    queryKey: [
      "products",
      "infinite",
      searchQuery,
      selectedCategory,
      selectedTags,
      ordering,
    ],
    queryFn: ({ pageParam = 1 }) =>
      catalogProductsList(buildQueryParams(pageParam)),
    getNextPageParam: createGetNextPageParam(),
    initialPageParam: 1,
  });

  const products = flattenPaginatedData(query.data);

  return {
    ...query,
    products,
    buildQueryParams,
  };
}

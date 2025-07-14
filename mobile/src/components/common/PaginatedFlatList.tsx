import React from "react";
import { FlatList, FlatListProps, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import { UseInfiniteQueryResult } from "@tanstack/react-query";

interface PaginatedFlatListProps<TData>
  extends Omit<FlatListProps<TData>, "data" | "renderItem" | "onEndReached"> {
  query: UseInfiniteQueryResult<any, Error>;
  data: TData[];
  renderItem: ({
    item,
    index,
  }: {
    item: TData;
    index: number;
  }) => React.ReactElement;
  emptyMessage?: string;
}

export function PaginatedFlatList<TData>({
  query,
  data,
  renderItem,
  emptyMessage = "No items found",
  ...flatListProps
}: PaginatedFlatListProps<TData>) {
  const { isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = query;

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={{ padding: 16, alignItems: "center" }}>
        <ActivityIndicator size="small" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={{ padding: 24, alignItems: "center" }}>
        <Text style={{ textAlign: "center" }}>{emptyMessage}</Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.2}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      {...flatListProps}
    />
  );
}

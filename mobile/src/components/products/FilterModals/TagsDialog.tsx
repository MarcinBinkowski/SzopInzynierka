import { catalogTagsList } from "@/api/generated/shop/catalog/catalog";
import { useDebounce } from "@/hooks/useDebounce";
import { createGetNextPageParam, flattenPaginatedData } from "@/lib/pagination";
import { useInfiniteQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Dialog,
  List,
  Portal,
  Searchbar,
  Text,
  useTheme,
} from "react-native-paper";

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

interface TagsDialogProps {
  visible: boolean;
  onDismiss: () => void;
  selectedTags: string[];
  onApplyTags: (tags: string[]) => void;
}

export function TagsDialog({
  visible,
  onDismiss,
  selectedTags,
  onApplyTags,
}: TagsDialogProps) {
  const theme = useTheme();
  const [draftTags, setDraftTags] = useState<string[]>(selectedTags);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const {
    data: tagsPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["tags", "infinite", debouncedSearchQuery],
    queryFn: ({ pageParam = 1 }) =>
      catalogTagsList({
        page: pageParam,
        page_size: 10,
        ...(debouncedSearchQuery && { search: debouncedSearchQuery }),
      }),
    getNextPageParam: createGetNextPageParam(),
    initialPageParam: 1,
    enabled: visible,
  });

  const tags = flattenPaginatedData(tagsPages);
  useEffect(() => {
    setDraftTags(selectedTags);
  }, [selectedTags]);

  const handleTagToggle = (slug: string) => {
    setDraftTags((prev) =>
      prev.includes(slug)
        ? prev.filter((tag) => tag !== slug)
        : [...prev, slug],
    );
  };

  const handleClearTags = () => {
    setDraftTags([]);
  };

  const handleApplyTags = () => {
    onApplyTags(draftTags);
    onDismiss();
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderTag = ({ item: tag }: { item: Tag }) => (
    <List.Item
      title={tag.name}
      left={(props) => (
        <List.Icon
          {...props}
          icon={
            draftTags.includes(tag.slug) ? "check-circle" : "radiobox-blank"
          }
        />
      )}
      onPress={() => handleTagToggle(tag.slug)}
      style={{
        backgroundColor: draftTags.includes(tag.slug)
          ? theme.colors.primaryContainer
          : undefined,
      }}
    />
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={{ padding: 16, alignItems: "center" }}>
        <ActivityIndicator size="small" />
      </View>
    );
  };

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onDismiss}
        style={{ backgroundColor: "white" }}
      >
        <Dialog.Title>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text variant="titleMedium">Select Tags</Text>
            {draftTags.length > 0 && (
              <Button mode="text" onPress={handleClearTags} compact>
                Clear All
              </Button>
            )}
          </View>
        </Dialog.Title>

        <Dialog.Content style={{ paddingHorizontal: 24 }}>
          <Searchbar
            placeholder="Search tags..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={{ marginBottom: 16 }}
          />

          <FlatList
            data={tags}
            renderItem={renderTag}
            keyExtractor={(tag: Tag) => tag.slug}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            style={{ maxHeight: 400 }}
            showsVerticalScrollIndicator={true}
          />
        </Dialog.Content>

        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button mode="contained" onPress={handleApplyTags}>
            Done ({draftTags.length})
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

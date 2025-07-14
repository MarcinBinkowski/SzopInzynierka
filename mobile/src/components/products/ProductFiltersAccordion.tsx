import React from "react";
import { View } from "react-native";
import { List, Badge, useTheme, Chip } from "react-native-paper";

export interface ProductFilters {
  searchQuery: string;
  selectedCategory: number | null;
  selectedTags: string[];
  ordering: string | null;
}

interface ProductFiltersAccordionProps {
  filters: ProductFilters;
  selectedCategoryName: string;
  onShowCategoryDialog: () => void;
  onShowTagDialog: () => void;
  onShowSortDialog: () => void;
  onClearFilters: () => void;
}

export function ProductFiltersAccordion({
  filters,
  selectedCategoryName,
  onShowCategoryDialog,
  onShowTagDialog,
  onShowSortDialog,
  onClearFilters,
}: ProductFiltersAccordionProps) {
  const theme = useTheme();
  const { selectedCategory, selectedTags, ordering } = filters;

  const activeFiltersCount = [
    selectedCategory,
    selectedTags.length > 0,
    ordering,
  ].filter(Boolean).length;

  const getSortLabel = () => {
    if (!ordering) return "Sort";

    switch (ordering) {
      case "name_lower":
        return "Sort: Name ↑";
      case "-name_lower":
        return "Sort: Name ↓";
      case "effective_price":
        return "Sort: Price ↑";
      case "-effective_price":
        return "Sort: Price ↓";
      default:
        return "Sort";
    }
  };

  return (
    <List.Accordion
      title="Filters & Sort"
      left={(props) => <List.Icon {...props} icon="tune" />}
      right={(props) => (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {activeFiltersCount > 0 && (
            <Badge
              size={20}
              style={{ marginRight: 8, backgroundColor: theme.colors.primary }}
            >
              {activeFiltersCount}
            </Badge>
          )}
          <List.Icon
            {...props}
            icon={props.isExpanded ? "chevron-up" : "chevron-down"}
          />
        </View>
      )}
      style={{ marginBottom: 12 }}
    >
      <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <Chip
            mode="outlined"
            onPress={onShowCategoryDialog}
            icon="filter-variant"
          >
            {selectedCategoryName}
          </Chip>

          <Chip mode="outlined" onPress={onShowTagDialog} icon="tag">
            {selectedTags.length > 0 ? `Tags: ${selectedTags.length}` : "Tags"}
          </Chip>

          <Chip mode="outlined" onPress={onShowSortDialog} icon="sort">
            {getSortLabel()}
          </Chip>

          {activeFiltersCount > 0 && (
            <Chip
              mode="outlined"
              onPress={onClearFilters}
              icon="close"
              style={{ backgroundColor: theme.colors.errorContainer }}
            >
              Clear
            </Chip>
          )}
        </View>
      </View>
    </List.Accordion>
  );
}

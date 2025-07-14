import React from "react";
import { View, ScrollView } from "react-native";
import {
  List,
  Button,
  useTheme,
  ActivityIndicator,
  Dialog,
  Portal,
} from "react-native-paper";
import { useCatalogCategoriesList } from "@/api/generated/shop/catalog/catalog";

export interface Category {
  id: number;
  name: string;
}

interface CategoryDialogProps {
  visible: boolean;
  onDismiss: () => void;
  selectedCategory: number | null;
  onCategorySelect: (categoryId: number | null) => void;
}

export function CategoryDialog({
  visible,
  onDismiss,
  selectedCategory,
  onCategorySelect,
}: CategoryDialogProps) {
  const theme = useTheme();

  const { data: categoriesData, isLoading } = useCatalogCategoriesList(
    undefined,
    { query: { enabled: visible } },
  );
  const categories = categoriesData || [];

  const handleCategorySelect = (categoryId: number | null) => {
    onCategorySelect(categoryId);
    onDismiss();
  };

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onDismiss}
        style={{ backgroundColor: "white" }}
      >
        <Dialog.Title>Select Category</Dialog.Title>

        <Dialog.Content>
          {isLoading ? (
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                height: 200,
              }}
            >
              <ActivityIndicator size="large" />
            </View>
          ) : (
            <>
              <List.Item
                title="All Categories"
                left={(props) => (
                  <List.Icon
                    {...props}
                    icon={!selectedCategory ? "check-circle" : "radiobox-blank"}
                  />
                )}
                onPress={() => handleCategorySelect(null)}
                style={{
                  backgroundColor: !selectedCategory
                    ? theme.colors.primaryContainer
                    : undefined,
                }}
              />

              <ScrollView style={{ maxHeight: 400 }}>
                {categories.map((category) => (
                  <List.Item
                    key={category.id}
                    title={category.name}
                    left={(props) => (
                      <List.Icon
                        {...props}
                        icon={
                          selectedCategory === category.id
                            ? "check-circle"
                            : "radiobox-blank"
                        }
                      />
                    )}
                    onPress={() => handleCategorySelect(category.id)}
                    style={{
                      backgroundColor:
                        selectedCategory === category.id
                          ? theme.colors.primaryContainer
                          : undefined,
                    }}
                  />
                ))}
              </ScrollView>
            </>
          )}
        </Dialog.Content>

        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancel</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

import React from "react";
import { List, Button, useTheme, Dialog, Portal } from "react-native-paper";

interface SortDialogProps {
  visible: boolean;
  onDismiss: () => void;
  ordering: string | null;
  onSelect: (ordering: string | null) => void;
}

export function SortDialog({
  visible,
  onDismiss,
  ordering,
  onSelect,
}: SortDialogProps) {
  const theme = useTheme();

  const handleSelect = (value: string | null) => {
    onSelect(value);
    onDismiss();
  };

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onDismiss}
        style={{ backgroundColor: "white" }}
      >
        <Dialog.Title>Sort By</Dialog.Title>
        <Dialog.Content>
          <List.Item
            title="Default"
            left={(props) => (
              <List.Icon
                {...props}
                icon={ordering ? "radiobox-blank" : "check-circle"}
              />
            )}
            onPress={() => handleSelect(null)}
            style={{
              backgroundColor: !ordering
                ? theme.colors.primaryContainer
                : undefined,
            }}
          />
          <List.Item
            title="Name A–Z"
            left={(props) => (
              <List.Icon
                {...props}
                icon={ordering === "name" ? "check-circle" : "radiobox-blank"}
              />
            )}
            onPress={() => handleSelect("name")}
            style={{
              backgroundColor:
                ordering === "name" ? theme.colors.primaryContainer : undefined,
            }}
          />
          <List.Item
            title="Name Z–A"
            left={(props) => (
              <List.Icon
                {...props}
                icon={ordering === "-name" ? "check-circle" : "radiobox-blank"}
              />
            )}
            onPress={() => handleSelect("-name")}
            style={{
              backgroundColor:
                ordering === "-name"
                  ? theme.colors.primaryContainer
                  : undefined,
            }}
          />
          <List.Item
            title="Price Low–High"
            left={(props) => (
              <List.Icon
                {...props}
                icon={ordering === "price" ? "check-circle" : "radiobox-blank"}
              />
            )}
            onPress={() => handleSelect("price")}
            style={{
              backgroundColor:
                ordering === "price"
                  ? theme.colors.primaryContainer
                  : undefined,
            }}
          />
          <List.Item
            title="Price High–Low"
            left={(props) => (
              <List.Icon
                {...props}
                icon={ordering === "-price" ? "check-circle" : "radiobox-blank"}
              />
            )}
            onPress={() => handleSelect("-price")}
            style={{
              backgroundColor:
                ordering === "-price"
                  ? theme.colors.primaryContainer
                  : undefined,
            }}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancel</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

export default SortDialog;

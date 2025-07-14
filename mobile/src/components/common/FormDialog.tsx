import React from "react";
import { Dialog, Portal } from "react-native-paper";
import { StyleSheet } from "react-native";

interface FormModalProps {
  visible: boolean;
  onDismiss: () => void;
  children: React.ReactNode;
}

export function FormDialog({ visible, onDismiss, children }: FormModalProps) {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Content>{children}</Dialog.Content>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    backgroundColor: "white",
  },
});

export default FormDialog;

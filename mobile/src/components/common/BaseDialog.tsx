import React from 'react';
import { StyleSheet } from 'react-native';
import { Dialog, Portal } from 'react-native-paper';

interface BaseDialogProps {
  visible: boolean;
  onDismiss: () => void;
  children: React.ReactNode;
  maxHeight?: string;
}

export function BaseDialog({ 
  visible, 
  onDismiss, 
  children, 
  maxHeight = '80%' 
}: BaseDialogProps) {
  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onDismiss}
        style={[styles.dialog, { maxHeight }]}
      >
        <Dialog.Content style={styles.content}>
          {children}
        </Dialog.Content>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    backgroundColor: 'white',
  },
  content: {
    padding: 0,
  },
});

export default BaseDialog;
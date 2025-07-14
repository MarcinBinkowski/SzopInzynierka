import { useState } from 'react';

export function useEditModal<T>() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<T | undefined>(undefined);

  const handleClose = () => {
    setIsModalVisible(false);
    setEditingItem(undefined);
  };

  const handleEdit = (item: T) => {
    setEditingItem(item);
    setIsModalVisible(true);
  };

  const handleCreate = () => {
    setEditingItem(undefined);
    setIsModalVisible(true);
  };

  return {
    isModalVisible,
    editingItem,
    handleClose,
    handleEdit,
    handleCreate
  };
}
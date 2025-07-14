import { createScreeningRoom, deleteScreeningRoom, getScreeningRooms, updateScreeningRoom } from '#/api/screening-rooms';
import { ScreeningRoom } from '#/api/types';
import { CardItem } from '#/components/CardItem';
import { FormModal } from '#/components/FormModal';
import { ScreenTemplate } from '#/components/ScreenTemplate';
import { useEditModal } from '#/hooks/useEditModal';
import { FormField } from '#/types/form';
import { Icon, Text } from '@rneui/themed';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const screeningRoomFields: FormField<ScreeningRoom>[] = [
  {
    name: 'roomNumber',
    label: 'Room Number',
    type: 'number',
    placeholder: 'Enter room number',
    required: true,
    keyboardType: 'numeric',
    validation: (value) => {
      const num = parseInt(value, 10);
      if (isNaN(num) || num <= 0) return 'Room number must be a positive number';
    }
  },
  {
    name: 'capacity',
    label: 'Capacity',
    type: 'number',
    placeholder: 'Enter capacity',
    required: true,
    keyboardType: 'numeric',
    validation: (value) => {
      const num = parseInt(value, 10);
      if (isNaN(num) || num <= 0) return 'Capacity must be a positive number';
    }
  }
];

export default function ScreeningRoomsScreen() {
  const [rooms, setRooms] = useState<ScreeningRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const {
    isModalVisible,
    editingItem,
    handleClose,
    handleEdit,
    handleCreate
  } = useEditModal<ScreeningRoom>();

  useFocusEffect(
    useCallback(() => {
      loadRooms();
    }, [])
  );


  const loadRooms = async () => {
    try {
      const data = await getScreeningRooms();
      setRooms(data);
    } catch (err) {
      console.error('Failed to load screening rooms:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrUpdate = async (roomData: Partial<ScreeningRoom>) => {
    try {
      const formattedData = {
        ...roomData,
        roomNumber: Number(roomData.roomNumber),
        capacity: Number(roomData.capacity)
      };

      if (editingItem) {
        const updated = await updateScreeningRoom({ ...formattedData, id: editingItem.id } as ScreeningRoom);
        setRooms(prev => prev.map(r => r.id === editingItem.id ? { ...editingItem, ...updated } : r));
      } else {
        const created = await createScreeningRoom(formattedData as Omit<ScreeningRoom, 'id'>);
        setRooms(prev => [...prev, created]);
      }
      handleClose();
    } catch (err) {
      console.error('Failed to save screening room:', err);
      Alert.alert('Error', 'Failed to save screening room');
    }
  };

  const handleDelete = async (room: ScreeningRoom) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete Room ${room.roomNumber}?`,
      [
        { text: 'Cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteScreeningRoom(room.id);
              setRooms(prev => prev.filter(r => r.id !== room.id));
            } catch (err) {
              console.error('Failed to delete screening room:', err);
              Alert.alert('Error', 'Failed to delete screening room');
            }
          }
        }
      ]
    );
  };

  const renderRoomContent = (room: ScreeningRoom) => (
    <>
      <Text h4 h4Style={styles.contentText}>
        <Icon name="meeting-room" size={20} /> Room Number: {room.roomNumber}
      </Text>
      <Text h4 h4Style={styles.contentText}>
        <Icon name="people" size={20} /> Capacity: {room.capacity} seats
      </Text>
    </>
  );

  if (isLoading) {
    return (
      <SafeAreaView>
        <Text h4 style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <ScreenTemplate 
      title="Screening Rooms"
      isLoading={isLoading}
      onCreatePress={handleCreate}
    >
      {rooms.map((room) => (
        <CardItem
          key={room.id}
          title={`Room ${room.roomNumber}`}
          item={room}
          onEdit={handleEdit}
          onDelete={handleDelete}
          renderContent={() => renderRoomContent(room)}
        />
      ))}

      <FormModal<ScreeningRoom>
        visible={isModalVisible}
        title={editingItem ? 'Edit Room' : 'Create Room'}
        fields={screeningRoomFields}
        onClose={handleClose}
        onSubmit={handleCreateOrUpdate}
        initialValues={editingItem}
        submitLabel={editingItem ? 'Update' : 'Create'}
      />
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  contentText: {
    fontSize: 16,
    marginVertical: 4
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
  },
});
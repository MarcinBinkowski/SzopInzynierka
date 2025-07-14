import { getMovies } from '#/api/movies';
import { getScreeningRooms } from '#/api/screening-rooms';
import { createScreening, deleteScreening, getScreenings, updateScreening } from '#/api/screenings';
import { Movie, Screening, ScreeningRoom } from '#/api/types';
import { CardItem } from '#/components/CardItem';
import { FormModal } from '#/components/FormModal';
import { ScreenTemplate } from '#/components/ScreenTemplate';
import { useEditModal } from '#/hooks/useEditModal';
import { FormField } from '#/types/form';
import { formatDateTimeForDisplay, isValidDateTime } from '#/utils/dateFormatters';
import { Icon, Text } from '@rneui/themed';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';

const screeningFields = (movies: Movie[], rooms: ScreeningRoom[]): FormField<Screening>[] => [
  {
    name: 'movieId',
    label: 'Movie',
    type: 'select',
    placeholder: 'Select movie',
    required: true,
    keyboardType: 'default',
    options: movies.map(movie => ({
      value: Number(movie.id),
      label: movie.title
    }))
  },
  {
    name: 'roomId',
    label: 'Room',
    type: 'select',
    placeholder: 'Select room',
    required: true,
    keyboardType: 'numeric',
    options: rooms.map(room => ({
        value: room.id,
        label: room.roomNumber.toString()
      })),
    validation: (value) => {
      const num = parseInt(value, 10);
      if (isNaN(num) || num <= 0) return 'Please select a valid room';
    }
  },
  {
    name: 'screeningTime',
    label: 'Screening Time',
    type: 'datetime',
    placeholder: 'DD.MM.YYYY HH:mm',
    required: true,
    keyboardType: 'default',
    validation: (value) => {
      if (!isValidDateTime(value)) {
        return 'Please enter valid date and time (DD.MM.YYYY HH:mm)';
      }
    }
  }
];
export default function ScreeningsScreen() {
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [rooms, setRooms] = useState<ScreeningRoom[]>([]);
  
  const {
    isModalVisible,
    editingItem,
    handleClose,
    handleEdit,
    handleCreate
  } = useEditModal<Screening>();

  useFocusEffect(
    useCallback(() => {
      loadScreenings();
      loadMovies();
      loadRooms();    }, [])
  );


  const loadScreenings = async () => {
    try {
      const data = await getScreenings();
      setScreenings(data);
    } catch (err) {
      console.error('Failed to load screenings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMovies = async () => {
    try {
      const moviesList = await getMovies();
      setMovies(moviesList);
    } catch (err) {
      console.error('Failed to load movies:', err);
    }
  };

  const loadRooms = async () => {
    try {
      const roomsList = await getScreeningRooms();
      setRooms(roomsList);
    } catch (err) {
      console.error('Failed to load rooms:', err);
    }
  };

  const handleCreateOrUpdate = async (screeningData: Partial<Screening>) => {
    try {
      console.log('Creating/Updating screening with data:', screeningData);
      const formattedData = {
        ...screeningData,
        movieId: Number(screeningData.movieId),
        roomId: Number(screeningData.roomId)
      };
      
      if (editingItem) {
        const updated = await updateScreening({ ...formattedData, id: editingItem.id } as Screening);
        setScreenings(prev => prev.map(s => s.id === editingItem.id ? updated : s));
      } else {
        const created = await createScreening(formattedData as Omit<Screening, 'id'>);
        setScreenings(prev => [...prev, created]);
      }
      handleClose();
    } catch (err) {
      console.error('Failed to save screening:', err);
      Alert.alert('Error', 'Failed to save screening');
    }
  };

  const handleDelete = async (screening: Screening) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete this screening?`,
      [
        { text: 'Cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteScreening(screening.id);
              setScreenings(prev => prev.filter(s => s.id !== screening.id));
            } catch (err) {
              console.error('Failed to delete screening:', err);
              Alert.alert('Error', 'Failed to delete screening');
            }
          }
        }
      ]
    );
  };

  const renderScreeningContent = (screening: Screening) => {
    const movie = movies.find(m => m.id === screening.movieId);
    const room = rooms.find(r => r.id === screening.roomId);

    return (
      <>
        <Text h4 h4Style={styles.contentText}>
          <Icon name="movie" size={20} /> Movie: {movie?.title || 'Loading...'}
        </Text>
        <Text h4 h4Style={styles.contentText}>
          <Icon name="room" size={20} /> Room: {room?.roomNumber || 'Loading...'}
        </Text>
        <Text h4 h4Style={styles.contentText}>
          <Icon name="access-time" size={20} /> Time: {formatDateTimeForDisplay(screening.screeningTime)}
        </Text>
      </>
    );
  };

  return (
    <ScreenTemplate 
      title="Screenings"
      isLoading={isLoading}
      onCreatePress={handleCreate}
    >
      {screenings.map((screening) => (
        <CardItem
          key={screening.id}
          title={`Screening #${screening.id}`}
          item={screening}
          onEdit={handleEdit}
          onDelete={handleDelete}
          renderContent={() => renderScreeningContent(screening)}
        />
      ))}

      <FormModal<Screening>
        visible={isModalVisible}
        title={editingItem ? 'Edit Screening' : 'Create Screening'}
        fields={screeningFields(movies, rooms)}
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
  }
});
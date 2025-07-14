import { createMovie, deleteMovie, getMovies, updateMovie } from '#/api/movies';
import type { Movie } from '#/api/types';
import { CardItem } from '#/components/CardItem';
import { FormModal } from '#/components/FormModal';
import { ScreenTemplate } from '#/components/ScreenTemplate';
import { useEditModal } from '#/hooks/useEditModal';
import { FormField } from '#/types/form';
import { formatDateForDisplay, isValidDate } from '#/utils/dateFormatters';
import { Icon, Text } from '@rneui/themed';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const movieFields: FormField<Movie>[] = [
  {
    name: 'title',
    label: 'Title',
    type: 'text',
    placeholder: 'Enter movie title',
    keyboardType: 'default',
    required: true
  },
  {
    name: 'durationMinutes',
    label: 'Duration (minutes)',
    type: 'number',
    placeholder: 'Enter duration',
    keyboardType: 'numeric',
    required: true,
    validation: (value: string) => {
      const num = parseInt(value, 10);
      if (isNaN(num) || num <= 0) return 'Duration must be a positive number';
    }
  },
  {
    name: 'releaseDate',
    label: 'Release Date',
    type: 'date',
    placeholder: 'DD.MM.YYYY',
    keyboardType: 'default',
    required: true,
    validation: (value: string) => {
      if (value && !isValidDate(value)) return 'Please enter date in DD.MM.YYYY format';
    }
  }
];


export default function MoviesScreen() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const {
    isModalVisible,
    editingItem,
    handleClose,
    handleEdit,
    handleCreate
  } = useEditModal<Movie>();

  useFocusEffect(
    useCallback(() => {
      loadMovies();
    }, [])
  );
  const loadMovies = async () => {
    try {
      setIsLoading(true);
      const data = await getMovies();
      setMovies(data);
    } catch (err) {
      console.error('Failed to load movies:', err);
    }
    finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrUpdate = async (movieData: Partial<Movie>) => {
    try {
      if (editingItem) {
        const updatedMovie = await updateMovie({ ...movieData, id: editingItem.id } as Movie);
        setMovies(prev => prev.map(movie => 
          movie.id === editingItem.id ? updatedMovie : movie
        ));
      } else {
        const newMovie = await createMovie(movieData as Omit<Movie, 'id'>);
        setMovies(prev => [...prev, newMovie]);
      }
      handleClose();
    } catch (err) {
      console.error('Failed to save movie:', err);
      Alert.alert('Error', 'Failed to save movie. Please try again.');
    }
  };

  const handleDelete = async (movie: Movie) => {
    try {
      Alert.alert(
        'Confirm Delete',
        `Are you sure you want to delete "${movie.title}"?`,
        [
          { text: 'Cancel'},
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              await deleteMovie(movie.id);
              setMovies(prevMovies => 
                prevMovies.filter(m => m.id !== movie.id)
              );
            }
          }
        ]
      );
    } catch (error) {
      console.error('Failed to delete movie:', error);
      Alert.alert('Error', 'Failed to delete movie. Please try again.');
    }
  };

  const renderMovieContent = (movie: Movie) => (
    <>
      <Text h4 h4Style={styles.contentText}>
        <Icon name="access-time" size={20} /> {movie.durationMinutes} minutes
      </Text>
      {movie.releaseDate && (
        <Text h4 h4Style={styles.contentText}>
          <Icon name="event" size={20} /> Release date: {formatDateForDisplay(movie.releaseDate)}
        </Text>
      )}
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
      title="Movies" 
      isLoading={isLoading}
      onCreatePress={handleCreate}
    >
      {movies.map((movie) => (
        <CardItem
          key={movie.id}
          title={movie.title}
          item={movie}
          onEdit={handleEdit}
          onDelete={handleDelete}
          renderContent={renderMovieContent}
        />
      ))}
      <FormModal<Movie>
        visible={isModalVisible}
        title={editingItem ? 'Edit Movie' : 'Create Movie'}
        fields={movieFields}
        onClose={handleClose}
        onSubmit={handleCreateOrUpdate}
        initialValues={editingItem}
        submitLabel={editingItem ? 'Update' : 'Create'}
        cancelLabel="Cancel"
      />
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginVertical: 20,
  },
  title: {
    marginBottom: 0,
  },
  container: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  contentText: {
    fontSize: 20,
    marginBottom: 10,
  },
  createButton: {
    backgroundColor: '#2089dc',
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
  },
});
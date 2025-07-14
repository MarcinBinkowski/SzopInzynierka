import { Button, Card, Icon } from '@rneui/themed';
import { ReactNode } from 'react';
import { StyleSheet } from 'react-native';

interface CardItemProps<T> {
  title: string;
  item: T;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  renderContent: (item: T) => ReactNode;
}

export function CardItem<T extends { id?: number }>({ 
  title,
  item,
  onEdit,
  onDelete,
  renderContent
}: CardItemProps<T>) {
  return (
    <Card containerStyle={styles.card}>
      <Card.Title h3>{title}</Card.Title>
      <Card.Divider />
      
      {renderContent(item)}
      
      <Card.Divider />
      
      <Button
        type="outline"
        onPress={() => onEdit(item)}
        icon={<Icon name="edit" color="#2089dc" size={24} />}
        title=" Edit"
        titleStyle={styles.buttonText}
        buttonStyle={styles.editButton}
      />
      <Button
        type="outline"
        onPress={() => onDelete(item)}
        icon={<Icon name="delete" color="#ff0000" size={24} />}
        title=" Delete"
        titleStyle={[styles.buttonText, styles.deleteText]}
        buttonStyle={styles.deleteButton}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    elevation: 3,
    marginBottom: 15,
  },
  buttonText: {
    fontSize: 18,
  },
  deleteText: {
    color: '#ff0000',
  },
  editButton: {
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 2,
  },
  deleteButton: {
    borderRadius: 8,
    borderColor: '#ff0000',
    borderWidth: 2,
  },
});
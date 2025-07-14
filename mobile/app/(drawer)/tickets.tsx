import { getScreenings } from '#/api/screenings';
import { createTicket, deleteTicket, getTickets, updateTicket } from '#/api/tickets';
import { Screening, Ticket } from '#/api/types';
import { CardItem } from '#/components/CardItem';
import { FormModal } from '#/components/FormModal';
import { ScreenTemplate } from '#/components/ScreenTemplate';
import { useEditModal } from '#/hooks/useEditModal';
import { FormField } from '#/types/form';
import { formatDateTimeForDisplay } from '#/utils/dateFormatters';
import { Icon, Text } from '@rneui/themed';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';

const ticketFields = (screenings: Screening[]): FormField<Ticket>[] => [
  {
    name: 'screeningId',
    label: 'Screening',
    type: 'select',
    placeholder: 'Select screening',
    required: true,
    keyboardType: 'numeric',
    options: screenings.map(screening => ({
      value: screening.id,
      label: `Screening #${screening.id} - ${formatDateTimeForDisplay(screening.screeningTime)}`
    }))
  },
  {
    name: 'seatNumber',
    label: 'Seat Number',
    type: 'number',
    placeholder: 'Enter seat number',
    required: true,
    keyboardType: 'numeric',
    validation: (value) => {
      const num = parseInt(value, 10);
      if (isNaN(num) || num <= 0) return 'Seat number must be a positive number';
    }
  },
  {
    name: 'price',
    label: 'Price',
    type: 'number',
    placeholder: 'Enter ticket price',
    required: true,
    keyboardType: 'numeric',
    validation: (value) => {
      const num = parseFloat(value);
      if (isNaN(num) || num <= 0) return 'Price must be a positive number';
    }
  }
];

export default function TicketsScreen() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const {
    isModalVisible,
    editingItem,
    handleClose,
    handleEdit,
    handleCreate
  } = useEditModal<Ticket>();
  useFocusEffect(
    useCallback(() => {
      loadTickets();
      loadScreenings();
    }, [])
  );

  const loadTickets = async () => {
    try {
      const data = await getTickets();
      setTickets(data);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadScreenings = async () => {
    try {
      const data = await getScreenings();
      setScreenings(data);
    } catch (err) {
      console.error('Failed to load screenings:', err);
    }
  };

  const handleCreateOrUpdate = async (ticketData: Partial<Ticket>) => {
    try {
      const formattedData = {
        ...ticketData,
        screeningId: Number(ticketData.screeningId),
        seatNumber: Number(ticketData.seatNumber),
        price: Number(ticketData.price)
      };

      if (editingItem) {
        const updated = await updateTicket({ ...formattedData, id: editingItem.id } as Ticket);
        setTickets(prev => prev.map(t => t.id === editingItem.id ? { ...editingItem, ...updated } : t));
      } else {
        const created = await createTicket(formattedData as Omit<Ticket, 'id'>);
        setTickets(prev => [...prev, created]);
      }
      handleClose();
    } catch (err) {
      console.error('Failed to save ticket:', err);
      Alert.alert('Error', 'Failed to save ticket');
    }
  };

  const handleDelete = async (ticket: Ticket) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete Ticket #${ticket.id}?`,
      [
        { text: 'Cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTicket(ticket.id);
              setTickets(prev => prev.filter(t => t.id !== ticket.id));
            } catch (err) {
              console.error('Failed to delete ticket:', err);
              Alert.alert('Error', 'Failed to delete ticket');
            }
          }
        }
      ]
    );
  };

  const renderTicketContent = (ticket: Ticket) => {
    const screening = screenings.find(s => s.id === ticket.screeningId);

    return (
      <>
        <Text h4 h4Style={styles.contentText}>
          <Icon name="event-seat" size={20} /> Seat: {ticket.seatNumber}
        </Text>
        <Text h4 h4Style={styles.contentText}>
          <Icon name="attach-money" size={20} /> Price: ${ticket.price}
        </Text>
        <Text h4 h4Style={styles.contentText}>
          <Icon name="access-time" size={20} /> Screening: {screening ? 
            formatDateTimeForDisplay(screening.screeningTime) : 
            'Loading...'}
        </Text>
      </>
    );
  };

  return (
    <ScreenTemplate 
      title="Tickets"
      isLoading={isLoading}
      onCreatePress={handleCreate}
    >
      {tickets.map((ticket) => (
        <CardItem
          key={ticket.id}
          title={`Ticket #${ticket.id}`}
          item={ticket}
          onEdit={handleEdit}
          onDelete={handleDelete}
          renderContent={() => renderTicketContent(ticket)}
        />
      ))}

      <FormModal<Ticket>
        visible={isModalVisible}
        title={editingItem ? 'Edit Ticket' : 'Create Ticket'}
        fields={ticketFields(screenings)}
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
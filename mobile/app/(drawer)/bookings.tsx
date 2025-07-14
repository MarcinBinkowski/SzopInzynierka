import {
  createBooking,
  deleteBooking,
  getBookings,
  updateBooking,
} from "#/api/bookings";
import { getCustomers } from "#/api/customers";
import { getTickets } from "#/api/tickets";
import { Booking, Customer, Ticket } from "#/api/types";
import { CardItem } from "#/components/CardItem";
import { FormModal } from "#/components/FormModal";
import { ScreenTemplate } from "#/components/ScreenTemplate";
import { useEditModal } from "#/hooks/useEditModal";
import { FormField } from "#/types/form";
import { Icon, Text } from "@rneui/themed";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, StyleSheet } from "react-native";

const bookingFields = (
  customers: Customer[],
  tickets: Ticket[]
): FormField<Booking>[] => [
  {
    name: "customerId",
    label: "Customer",
    type: "select",
    placeholder: "Select customer",
    required: true,
    keyboardType: "default",
    options: customers.map((customer) => ({
      value: Number(customer.id),
      label: `${customer.firstName} ${customer.lastName}`,
    })),
  },
  {
    name: "ticketId",
    label: "Ticket",
    type: "select",
    placeholder: "Select ticket",
    required: true,
    keyboardType: "numeric",
    options: tickets.map((ticket) => ({
      value: ticket.id,
      label: `Ticket #${ticket.id}`,
    })),
  },
];

export default function BookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const { isModalVisible, editingItem, handleClose, handleEdit, handleCreate } =
    useEditModal<Booking>();

  useFocusEffect(
    useCallback(() => {
      loadBookings();
      loadCustomers();
      loadTickets();
    }, [])
  );

  const loadBookings = async () => {
    try {
      const data = await getBookings();
      setBookings(data);
    } catch (err) {
      console.error("Failed to load bookings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const customersList = await getCustomers();
      setCustomers(customersList);
    } catch (err) {
      console.error("Failed to load customers:", err);
    }
  };

  const loadTickets = async () => {
    try {
      const ticketsList = await getTickets();
      setTickets(ticketsList);
    } catch (err) {
      console.error("Failed to load tickets:", err);
    }
  };

  const handleCreateOrUpdate = async (bookingData: Partial<Booking>) => {
    try {
      const formattedData = {
        ...bookingData,
        customerId: Number(bookingData.customerId),
        ticketId: Number(bookingData.ticketId),
      };

      if (editingItem) {
        const updated = await updateBooking({
          ...formattedData,
          id: editingItem.id,
        } as Booking);
        setBookings((prev) =>
          prev.map((b) => (b.id === editingItem.id ? { ...editingItem, ...updated } : b))
        );
      } else {
        const created = await createBooking(
          formattedData as Omit<Booking, "id">
        );
        setBookings((prev) => [...prev, created]);
      }
      handleClose();
    } catch (err) {
      console.error("Failed to save booking:", err);
      Alert.alert("Error", "Failed to save booking");
    }
  };

  const handleDelete = async (booking: Booking) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete this booking?`,
      [
        { text: "Cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteBooking(booking.id);
              setBookings((prev) => prev.filter((b) => b.id !== booking.id));
            } catch (err) {
              console.error("Failed to delete booking:", err);
              Alert.alert("Error", "Failed to delete booking");
            }
          },
        },
      ]
    );
  };

  const renderBookingContent = (booking: Booking) => {
    const customer = customers.find((c) => c.id === booking.customerId);
    const ticket = tickets.find((t) => t.id === booking.ticketId);

    return (
      <>
        <Text h4 h4Style={styles.contentText}>
          <Icon name="person" size={20} /> Customer:{" "}
          {customer
            ? `${customer.firstName} ${customer.lastName}`
            : "Loading..."}
        </Text>
        <Text h4 h4Style={styles.contentText}>
          <Icon name="local-activity" size={20} /> Ticket:{" "}
          {ticket ? `#${ticket.id}` : "Loading..."}
        </Text>
      </>
    );
  };

  return (
    <ScreenTemplate
      title="Bookings"
      isLoading={isLoading}
      onCreatePress={handleCreate}
    >
      {bookings.map((booking) => (
        <CardItem
          key={booking.id}
          title={`Booking #${booking.id}`}
          item={booking}
          onEdit={handleEdit}
          onDelete={handleDelete}
          renderContent={() => renderBookingContent(booking)}
        />
      ))}

      <FormModal<Booking>
        visible={isModalVisible}
        title={editingItem ? "Edit Booking" : "Create Booking"}
        fields={bookingFields(customers, tickets)}
        onClose={handleClose}
        onSubmit={handleCreateOrUpdate}
        initialValues={editingItem}
        submitLabel={editingItem ? "Update" : "Create"}
      />
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  contentText: {
    fontSize: 16,
    marginVertical: 4,
  },
});

import { createCustomer, deleteCustomer, getCustomers, updateCustomer } from '#/api/customers';
import { Customer } from '#/api/types';
import { CardItem } from '#/components/CardItem';
import { FormModal } from '#/components/FormModal';
import { ScreenTemplate } from '#/components/ScreenTemplate';
import { useEditModal } from '#/hooks/useEditModal';
import { FormField } from '#/types/form';
import { Icon, Text } from '@rneui/themed';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';

const customerFields: FormField<Customer>[] = [
  {
    name: 'firstName',
    label: 'First Name',
    type: 'text',
    placeholder: 'Enter first name',
    required: true,
    keyboardType: 'default',
    validation: (value) => {
      if (value.length < 2) return 'First name must be at least 2 characters';
    }
  },
  {
    name: 'lastName',
    label: 'Last Name',
    type: 'text',
    placeholder: 'Enter last name',
    required: true,
    keyboardType: 'default',
    validation: (value) => {
      if (value.length < 2) return 'Last name must be at least 2 characters';
    }
  },
  {
    name: 'email',
    label: 'Email',
    type: 'text',
    placeholder: 'Enter email',
    required: false,
    keyboardType: 'email-address',
    validation: (value) => {
      if (value && !value.includes('@')) return 'Please enter a valid email';
    }
  }
];

export default function CustomersScreen() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const {
    isModalVisible,
    editingItem,
    handleClose,
    handleEdit,
    handleCreate
  } = useEditModal<Customer>();

   useFocusEffect(
      useCallback(() => {
        loadCustomers();
      }, [])
    );

  const loadCustomers = async () => {
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrUpdate = async (customerData: Partial<Customer>) => {
    try {
      if (editingItem) {
        const updated = await updateCustomer({ ...customerData, id: editingItem.id } as Customer);
        setCustomers(prev => prev.map(c => c.id === editingItem.id ? updated : c));
      } else {
        const created = await createCustomer(customerData as Omit<Customer, 'id'>);
        setCustomers(prev => [...prev, created]);
      }
      handleClose();
    } catch (err) {
      console.error('Failed to save customer:', err);
      Alert.alert('Error', 'Failed to save customer');
    }
  };

  const handleDelete = async (customer: Customer) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete ${customer.firstName} ${customer.lastName}?`,
      [
        { text: 'Cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCustomer(customer.id);
              setCustomers(prev => prev.filter(c => c.id !== customer.id));
            } catch (err) {
              console.error('Failed to delete customer:', err);
              Alert.alert('Error', 'Failed to delete customer');
            }
          }
        }
      ]
    );
  };

  const renderCustomerContent = (customer: Customer) => {
    return (
      <>
        <Text h4 h4Style={styles.contentText}>
          <Icon name="person" size={20} /> Name: {customer.firstName} {customer.lastName}
        </Text>
        {customer.email && (
          <Text h4 h4Style={styles.contentText}>
            <Icon name="email" size={20} /> Email: {customer.email}
          </Text>
        )}
      </>
    );
  };

  return (
    <ScreenTemplate 
      title="Customers"
      isLoading={isLoading}
      onCreatePress={handleCreate}
    >
      {customers.map((customer) => (
        <CardItem
          key={customer.id}
          title={`${customer.firstName} ${customer.lastName}`}
          item={customer}
          onEdit={handleEdit}
          onDelete={handleDelete}
          renderContent={() => renderCustomerContent(customer)}
        />
      ))}

      <FormModal<Customer>
        visible={isModalVisible}
        title={editingItem ? 'Edit Customer' : 'Create Customer'}
        fields={customerFields}
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
import { createStaffRole, deleteStaffRole, getStaffRoles, updateStaffRole } from '#/api/staff-roles';
import { StaffRole } from '#/api/types';
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

const staffRoleFields: FormField<StaffRole>[] = [
  {
    name: 'roleName',
    label: 'Role Name',
    type: 'text',
    placeholder: 'Enter role name',
    required: true,
    keyboardType: 'default',
    validation: (value) => {
      if (value.length < 2) return 'Role name must be at least 2 characters';
    }
  },
  {
    name: 'description',
    label: 'Description',
    type: 'text',
    placeholder: 'Enter role description',
    required: false,
    keyboardType: 'default'
  }
];

export default function StaffRolesScreen() {
  const [roles, setRoles] = useState<StaffRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const {
    isModalVisible,
    editingItem,
    handleClose,
    handleEdit,
    handleCreate
  } = useEditModal<StaffRole>();

  useFocusEffect(
    useCallback(() => {
      loadRoles();
    }, [])
  );

  const loadRoles = async () => {
    try {
      const data = await getStaffRoles();
      setRoles(data);
    } catch (err) {
      console.error('Failed to load staff roles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrUpdate = async (roleData: Partial<StaffRole>) => {
    try {
      if (editingItem) {
        const updated = await updateStaffRole({ ...roleData, id: editingItem.id } as StaffRole);
        setRoles(prev => prev.map(r => r.id === editingItem.id ? { ...editingItem, ...updated } : r));
      } else {
        const created = await createStaffRole(roleData as Omit<StaffRole, 'id'>);
        setRoles(prev => [...prev, created]);
      }
      handleClose();
    } catch (err) {
      console.error('Failed to save staff role:', err);
      Alert.alert('Error', 'Failed to save staff role');
    }
  };

  const handleDelete = async (role: StaffRole) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete role "${role.roleName}"?`,
      [
        { text: 'Cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteStaffRole(role.id);
              setRoles(prev => prev.filter(r => r.id !== role.id));
            } catch (err) {
              console.error('Failed to delete staff role:', err);
              Alert.alert('Error', 'Failed to delete staff role');
            }
          }
        }
      ]
    );
  };

  const renderRoleContent = (role: StaffRole) => (
    <>
      <Text h4 h4Style={styles.contentText}>
        <Icon name="description" size={20} /> {role.description || 'No description'}
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
      title="Staff Roles"
      isLoading={isLoading}
      onCreatePress={handleCreate}
    >
      {roles.map((role) => (
        <CardItem
          key={role.id}
          title={role.roleName}
          item={role}
          onEdit={handleEdit}
          onDelete={handleDelete}
          renderContent={() => renderRoleContent(role)}
        />
      ))}

      <FormModal<StaffRole>
        visible={isModalVisible}
        title={editingItem ? 'Edit Role' : 'Create Role'}
        fields={staffRoleFields}
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
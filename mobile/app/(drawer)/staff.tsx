import { createStaffMember, deleteStaffMember, getStaff, updateStaffMember } from '#/api/staff';
import { getStaffRoles } from '#/api/staff-roles';
import { Staff, StaffRole } from '#/api/types';
import { CardItem } from '#/components/CardItem';
import { FormModal } from '#/components/FormModal';
import { ScreenTemplate } from '#/components/ScreenTemplate';
import { useEditModal } from '#/hooks/useEditModal';
import { FormField } from '#/types/form';
import { Icon, Text } from '@rneui/themed';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';

const staffFields = (roles: StaffRole[]): FormField<Staff>[] => [
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
    name: 'roleId',
    label: 'Role',
    type: 'select',
    placeholder: 'Select role',
    required: true,
    keyboardType: 'numeric',
    options: roles.map(role => ({
      value: role.id,
      label: role.roleName
    }))
  }
];

export default function StaffScreen() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [roles, setRoles] = useState<StaffRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const {
    isModalVisible,
    editingItem,
    handleClose,
    handleEdit,
    handleCreate
  } = useEditModal<Staff>();

  useFocusEffect(
    useCallback(() => {
      loadStaff();
      loadRoles();
    }, [])
  );

  const loadStaff = async () => {
    try {
      const data = await getStaff();
      setStaff(data);
      console.log('Staff data:', staff);
    } catch (err) {
      console.error('Failed to load staff:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const data = await getStaffRoles();
      setRoles(data);
      console.log('Staff roles:', roles);
    } catch (err) {

      console.error('Failed to load roles:', err);
    }
  };

  const handleCreateOrUpdate = async (staffData: Partial<Staff>) => {
    try {
      const formattedData = {
        ...staffData,
        roleId: Number(staffData.roleId)
      };

      if (editingItem) {
        const updated = await updateStaffMember({ ...formattedData, id: editingItem.id } as Staff);
        setStaff(prev => prev.map(s => s.id === editingItem.id ? { ...editingItem, ...updated } : s));
      } else {
        const created = await createStaffMember(formattedData as Omit<Staff, 'id'>);
        setStaff(prev => [...prev, created]);
      }
      handleClose();
    } catch (err) {
      console.error('Failed to save staff member:', err);
      Alert.alert('Error', 'Failed to save staff member');
    }
  };

  const handleDelete = async (staffMember: Staff) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete ${staffMember.firstName} ${staffMember.lastName}?`,
      [
        { text: 'Cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteStaffMember(staffMember.id);
              setStaff(prev => prev.filter(s => s.id !== staffMember.id));
            } catch (err) {
              console.error('Failed to delete staff member:', err);
              Alert.alert('Error', 'Failed to delete staff member');
            }
          }
        }
      ]
    );
  };

  const renderStaffContent = (staffMember: Staff) => {
    const role = roles.find(r => r.id === staffMember.roleId);

    return (
      <>
        <Text h4 h4Style={styles.contentText}>
          <Icon name="person" size={20} /> {staffMember.firstName} {staffMember.lastName}
        </Text>
        <Text h4 h4Style={styles.contentText}>
          <Icon name="work" size={20} /> Role: {role?.roleName || 'Loading...'}
        </Text>
      </>
    );
  };

  return (
    <ScreenTemplate 
      title="Staff"
      isLoading={isLoading}
      onCreatePress={handleCreate}
    >
      {staff.map((staffMember) => (
        <CardItem
          key={staffMember.id}
          title={`${staffMember.firstName} ${staffMember.lastName}`}
          item={staffMember}
          onEdit={handleEdit}
          onDelete={handleDelete}
          renderContent={() => renderStaffContent(staffMember)}
        />
      ))}

      <FormModal<Staff>
        visible={isModalVisible}
        title={editingItem ? 'Edit Staff Member' : 'Add Staff Member'}
        fields={staffFields(roles)}
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
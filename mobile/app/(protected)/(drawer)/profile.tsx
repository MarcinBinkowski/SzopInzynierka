import React, { useState, useCallback } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import { Text, Button, Card, useTheme, Switch } from "react-native-paper";
import { useAuth } from "@/hooks/useAuth";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import ScreenLoader from "@/components/common/ScreenLoader";
import ErrorScreen from "@/components/common/ErrorScreen";
import FormDialog from "@/components/common/FormDialog";
import ProfileForm from "@/components/profiles/ProfileForm";
import AddressForm from "@/components/addresses/AddressForm";
import { useQueryClient } from "@tanstack/react-query";
import {
  useProfileProfilesMeRetrieve,
  useProfileProfilesMePartialUpdate,
  useProfileAddressesCreate,
  useProfileAddressesPartialUpdate,
  useProfileAddressesDestroy,
  useProfileAddressesList,
  useProfileAddressesRetrieve,
  getProfileAddressesRetrieveQueryKey,
  getProfileAddressesListQueryKey,
  getProfileProfilesCheckoutStatusRetrieveQueryKey,
  getProfileProfilesMeRetrieveQueryKey,
} from "@/api/generated/shop/profile/profile";
import { getCatalogNotificationsPreferencesRetrieveQueryKey } from "@/api/generated/shop/notifications/notifications";
import {
  useCatalogNotificationsPreferencesRetrieve,
  useCatalogNotificationsPreferencesPartialUpdate,
} from "@/api/generated/shop/notifications/notifications";
import type { PatchedProfileUpdate } from "@/api/generated/shop/schemas/patchedProfileUpdate";
import type { AddressCreate } from "@/api/generated/shop/schemas/addressCreate";
import type { PatchedAddressUpdate } from "@/api/generated/shop/schemas/patchedAddressUpdate";
import type { AddressList } from "@/api/generated/shop/schemas/addressList";
import type { PatchedNotificationPreferenceUpdate } from "@/api/generated/shop/schemas/patchedNotificationPreferenceUpdate";

export default function ProfileScreen() {
  const { logout, userEmail } = useAuth();
  const theme = useTheme();
  const qc = useQueryClient();

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);

  const { data: profile, isLoading: profileLoading, error: profileError, refetch: refetchProfile } =
    useProfileProfilesMeRetrieve();

  const { data: addressesAll = [] } = useProfileAddressesList();

  const { data: notificationPrefs, isLoading: notificationPrefsLoading } =
    useCatalogNotificationsPreferencesRetrieve("me");

  const invalidateCheckoutRelated = () => {
    qc.invalidateQueries({ queryKey: getProfileAddressesListQueryKey() });
    qc.invalidateQueries({ queryKey: getProfileProfilesCheckoutStatusRetrieveQueryKey() });
  };

  const updateProfileMutation = useProfileProfilesMePartialUpdate({
    mutation: {
      onSuccess: () => {
        setShowEditProfile(false);
        qc.invalidateQueries({ queryKey: getProfileProfilesMeRetrieveQueryKey() });
        qc.invalidateQueries({ queryKey: getProfileProfilesCheckoutStatusRetrieveQueryKey() });
        Alert.alert("Success", "Profile updated successfully!");
      },
      onError: () => Alert.alert("Error", "Failed to update profile."),
    },
  });

  const createAddressMutation = useProfileAddressesCreate({
    mutation: {
      onSuccess: () => {
        setShowNewAddress(false);
        invalidateCheckoutRelated();
        Alert.alert("Success", "Address added successfully!");
      },
      onError: () => Alert.alert("Error", "Failed to add address."),
    },
  });

  const updateAddressMutation = useProfileAddressesPartialUpdate({
    mutation: {
      onSuccess: (_, vars) => {
        qc.removeQueries({ queryKey: getProfileAddressesRetrieveQueryKey(Number(vars.id)) });
        invalidateCheckoutRelated();
        setEditingAddressId(null);
        Alert.alert("Success", "Address updated successfully!");
      },
      onError: () => Alert.alert("Error", "Failed to update address."),
    },
  });

  const deleteAddressMutation = useProfileAddressesDestroy({
    mutation: {
      onSuccess: (_, vars) => {
        qc.removeQueries({ queryKey: getProfileAddressesRetrieveQueryKey(Number(vars.id)) });
        invalidateCheckoutRelated();
        setEditingAddressId(null);
        Alert.alert("Success", "Address deleted successfully!");
      },
      onError: () => Alert.alert("Error", "Failed to delete address."),
    },
  });

  const updateNotificationPrefsMutation = useCatalogNotificationsPreferencesPartialUpdate({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ 
          queryKey: getCatalogNotificationsPreferencesRetrieveQueryKey("me")
        });
        Alert.alert("Success", "Notification preferences updated!");
      },
      onError: () => Alert.alert("Error", "Failed to update notification preferences."),
    },
  });

  const handleProfileSubmit = useCallback(
    (data: PatchedProfileUpdate) => updateProfileMutation.mutate({ data }),
    [updateProfileMutation]
  );

  const handleAddressSubmit = useCallback(
    (data: AddressCreate | PatchedAddressUpdate) => {
      if (editingAddressId) {
        updateAddressMutation.mutate({ id: editingAddressId, data: data as PatchedAddressUpdate });
      } else {
        createAddressMutation.mutate({ data: data as AddressCreate });
      }
    },
    [editingAddressId, updateAddressMutation, createAddressMutation]
  );

  const handleAddressDelete = useCallback(() => {
    if (!editingAddressId) return;
    Alert.alert("Delete Address", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteAddressMutation.mutate({ id: editingAddressId }),
      },
    ]);
  }, [editingAddressId, deleteAddressMutation]);

  const allAddresses: AddressList[] = userEmail
    ? (addressesAll ?? []).filter((a: AddressList) => a.profile?.user_email === userEmail)
    : [];

  if (profileLoading || notificationPrefsLoading) return <ScreenLoader />;

  if (profileError || !profile) {
    return (
      <ErrorScreen
        title="Failed to load profile"
        message="We couldn't load your profile information. Please try again."
        onRetry={refetchProfile}
        onLogout={logout}
        showLogoutButton
      />
    );
  }

  return (
    <ScreenWrapper showBackButton={false}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Card.Title title="Personal Information" right={() => <Button onPress={() => setShowEditProfile(true)}>Edit</Button>} />
          <Card.Content>
            <Text style={styles.infoText}><Text style={styles.label}>Name: </Text>{profile.first_name && profile.last_name ? `${profile.first_name} ${profile.last_name}` : "Not provided"}</Text>
            <Text style={styles.infoText}><Text style={styles.label}>Phone: </Text>{profile.phone_number || "Not provided"}</Text>
            <Text style={styles.infoText}><Text style={styles.label}>Date of Birth: </Text>{profile.date_of_birth || "Not provided"}</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Notification Preferences" />
          <Card.Content>
            {notificationPrefs ? (
              <>
                <PrefRow
                  title="Stock Alerts"
                  desc="Get notified when out-of-stock wishlist items become available"
                  value={!!notificationPrefs.stock_alerts_enabled}
                  onChange={(v) =>
                    updateNotificationPrefsMutation.mutate({
                      id: String(notificationPrefs.id),
                      data: { stock_alerts_enabled: v } as PatchedNotificationPreferenceUpdate,
                    })
                  }
                  disabled={updateNotificationPrefsMutation.isPending}
                />
                <PrefRow
                  title="Price Drop Alerts"
                  desc="Get notified when wishlist items go on sale"
                  value={!!notificationPrefs.price_drop_alerts_enabled}
                  onChange={(v) =>
                    updateNotificationPrefsMutation.mutate({
                      id: String(notificationPrefs.id),
                      data: { price_drop_alerts_enabled: v } as PatchedNotificationPreferenceUpdate,
                    })
                  }
                  disabled={updateNotificationPrefsMutation.isPending}
                />
              </>
            ) : (
              <Text style={{ color: theme.colors.onSurfaceVariant }}>Loading notification preferences…</Text>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Addresses" right={() => <Button onPress={() => setShowNewAddress(true)}>Add</Button>} />
          <Card.Content>
            {allAddresses.length ? (
              <View style={styles.addressList}>
                {allAddresses.map((addr) => (
                  <View key={addr.id} style={styles.addressItem}>
                    <View style={styles.addressInfo}>
                      <Text>{addr.full_address}</Text>
                      {(addr.label || addr.is_default) && (
                        <Text style={styles.addressMeta}>
                          {addr.label && `${addr.label} • `}{addr.is_default && "Default"}
                        </Text>
                      )}
                    </View>
                    <Button onPress={() => setEditingAddressId(addr.id)}>Edit</Button>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={{ color: theme.colors.onSurfaceVariant }}>No addresses added</Text>
            )}
          </Card.Content>
        </Card>

        <Button mode="contained" onPress={logout} style={styles.logoutButton} icon="logout">
          Logout
        </Button>
      </ScrollView>

      {/* Dialog: profile */}
      <FormDialog visible={showEditProfile} onDismiss={() => setShowEditProfile(false)}>
        <ProfileForm
          initialData={profile}
          onSubmit={handleProfileSubmit}
          isLoading={updateProfileMutation.isPending}
          submitText="Update Profile"
        />
      </FormDialog>

      {/* Dialog: address (create/edit) */}
      {(showNewAddress || editingAddressId !== null) && (
        <AddressDialog
          editingId={editingAddressId}
          visible
          onDismiss={() => {
            setShowNewAddress(false);
            setEditingAddressId(null);
          }}
          onSubmit={handleAddressSubmit}
          onDelete={editingAddressId ? handleAddressDelete : undefined}
          isBusy={
            createAddressMutation.isPending ||
            updateAddressMutation.isPending ||
            deleteAddressMutation.isPending
          }
        />
      )}
    </ScreenWrapper>
  );
}

function PrefRow({
  title, desc, value, onChange, disabled,
}: { title: string; desc: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <View style={styles.preferenceItem}>
      <View style={styles.preferenceInfo}>
        <Text>{title}</Text>
        <Text style={styles.preferenceDescription}>{desc}</Text>
      </View>
      <Switch value={value} onValueChange={onChange} disabled={disabled} />
    </View>
  );
}

function AddressDialog({
  editingId, visible, onDismiss, onSubmit, onDelete, isBusy,
}: {
  editingId: number | null;
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (data: AddressCreate | PatchedAddressUpdate) => void;
  onDelete?: () => void;
  isBusy: boolean;
}) {
  // Hook jest wywoływany tylko gdy dialog jest w drzewie → bezpieczne
  const { data: editingAddress, isLoading } = useProfileAddressesRetrieve(editingId ?? 0, {
    query: { enabled: !!editingId },
  });

  return (
    <FormDialog visible={visible} onDismiss={onDismiss}>
      {editingId && isLoading ? (
        <ScreenLoader />
      ) : (
        <AddressForm
          initialData={editingId && editingAddress ? {
            address: editingAddress.address,
            city: editingAddress.city,
            postal_code: editingAddress.postal_code,
            country: editingAddress.country,
            profile: editingAddress.profile?.id,
            is_default: editingAddress.is_default,
            label: editingAddress.label,
          } : undefined}
          onSubmit={onSubmit}
          onDelete={onDelete}
          isLoading={isBusy || (editingId ? isLoading : false)}
          submitText={editingId ? "Update Address" : "Add Address"}
        />
      )}
    </FormDialog>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { marginBottom: 16, marginHorizontal: 8 },
  infoText: { marginBottom: 8 },
  label: { fontWeight: "600" },
  preferenceItem: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.1)",
  },
  preferenceInfo: { flex: 1, marginRight: 16 },
  preferenceDescription: { opacity: 0.7, marginTop: 4 },
  addressList: { gap: 16 },
  addressItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  addressInfo: { flex: 1, marginRight: 16 },
  addressMeta: { opacity: 0.7, marginTop: 4 },
  logoutButton: { marginHorizontal: 8, marginBottom: 32, marginTop: 24 },
});
import React, { useEffect, useState, useCallback } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import { Text, Button, Card, useTheme, Switch } from "react-native-paper";
import { useAuth } from "@/hooks/useAuth";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import ScreenLoader from "@/components/common/ScreenLoader";
import ErrorScreen from "@/components/common/ErrorScreen";
import FormDialog from "@/components/common/FormDialog";
import ProfileForm from "@/components/profiles/ProfileForm";
import AddressForm from "@/components/addresses/AddressForm";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useProfileProfilesMeRetrieve,
  useProfileProfilesMePartialUpdate,
} from "@/api/generated/shop/profile/profile";
import {
  useProfileAddressesCreate,
  useProfileAddressesPartialUpdate,
  useProfileAddressesRetrieve,
  useProfileAddressesDestroy,
  getProfileAddressesRetrieveQueryKey,
  getProfileAddressesListQueryKey,
  getProfileProfilesCheckoutStatusRetrieveQueryKey,
} from "@/api/generated/shop/profile/profile";
import { profileAddressesList } from "@/api/generated/shop/profile/profile";
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
  const { logout } = useAuth();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);

  const [editingAddress, setEditingAddress] = useState<any>(null);
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useProfileProfilesMeRetrieve();

  const {
    data: addressesAll,
    refetch: refetchAddresses,
  } = useQuery({
    queryKey: ["addresses-all"],
    queryFn: async () => {
      const res = await profileAddressesList({ page: 1, page_size: 1000 });
      const results = (res as any)?.results as AddressList[] | undefined;
      return Array.isArray(results) ? results : [];
    },
    staleTime: 60_000,
  });

  const { data: fullAddressData, isLoading: addressLoading } =
    useProfileAddressesRetrieve(editingAddressId!, {
      query: { enabled: !!editingAddressId },
    });

  const {
    data: notificationPrefs,
    isLoading: notificationPrefsLoading,
    refetch: refetchNotificationPrefs,
  } = useCatalogNotificationsPreferencesRetrieve("me");

  const updateProfileMutation = useProfileProfilesMePartialUpdate({
    mutation: {
      onSuccess: () => {
        setShowEditProfile(false);
        refetchProfile();
        queryClient.invalidateQueries({
          queryKey: getProfileProfilesCheckoutStatusRetrieveQueryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: getProfileAddressesListQueryKey(),
        });
        Alert.alert("Success", "Profile updated successfully!");
      },
      onError: () => {
        Alert.alert("Error", "Failed to update profile. Please try again.");
      },
    },
  });

  const createAddressMutation = useProfileAddressesCreate({
    mutation: {
      onSuccess: () => {
        setShowAddAddress(false);
        queryClient.invalidateQueries({
          queryKey: getProfileAddressesListQueryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: getProfileProfilesCheckoutStatusRetrieveQueryKey(),
        });
        refetchAddresses();
        Alert.alert("Success", "Address added successfully!");
      },
      onError: () => {
        Alert.alert("Error", "Failed to add address. Please try again.");
      },
    },
  });

  const updateAddressMutation = useProfileAddressesPartialUpdate({
    mutation: {
      onSuccess: (_, variables) => {
        queryClient.removeQueries({
          queryKey: getProfileAddressesRetrieveQueryKey(variables.id),
        });
        queryClient.invalidateQueries({
          queryKey: getProfileAddressesListQueryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: getProfileProfilesCheckoutStatusRetrieveQueryKey(),
        });
        refetchAddresses();

        setEditingAddressId(null);
        setEditingAddress(null);
        Alert.alert("Success", "Address updated successfully!");
      },
      onError: () => {
        Alert.alert("Error", "Failed to update address. Please try again.");
      },
    },
  });

  const deleteAddressMutation = useProfileAddressesDestroy({
    mutation: {
      onSuccess: (_, variables) => {
        queryClient.removeQueries({
          queryKey: getProfileAddressesRetrieveQueryKey(variables.id),
        });
        queryClient.invalidateQueries({
          queryKey: getProfileAddressesListQueryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: getProfileProfilesCheckoutStatusRetrieveQueryKey(),
        });
        refetchAddresses();

        setEditingAddressId(null);
        setEditingAddress(null);
        Alert.alert("Success", "Address deleted successfully!");
      },
      onError: () => {
        Alert.alert("Error", "Failed to delete address. Please try again.");
      },
    },
  });

  const updateNotificationPrefsMutation =
    useCatalogNotificationsPreferencesPartialUpdate({
      mutation: {
        onSuccess: () => {
          refetchNotificationPrefs();
          Alert.alert("Success", "Notification preferences updated!");
        },
        onError: () => {
          Alert.alert(
            "Error",
            "Failed to update notification preferences. Please try again.",
          );
        },
      },
    });

  const handleProfileSubmit = useCallback(
    (data: PatchedProfileUpdate) => {
      updateProfileMutation.mutate({
        data,
      });
    },
    [updateProfileMutation],
  );

  const handleAddressSubmit = useCallback(
    (data: AddressCreate | PatchedAddressUpdate) => {
      if (editingAddress) {
        updateAddressMutation.mutate({
          id: editingAddress.id.toString(),
          data: data as PatchedAddressUpdate,
        });
      } else {
        createAddressMutation.mutate({ data: data as AddressCreate });
      }
    },
    [editingAddress, updateAddressMutation, createAddressMutation],
  );

  const handleAddressDelete = useCallback(() => {
    if (!editingAddress) return;

    Alert.alert(
      "Delete Address",
      "Are you sure you want to delete this address? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteAddressMutation.mutate({
              id: editingAddress.id.toString(),
            });
          },
        },
      ],
    );
  }, [editingAddress, deleteAddressMutation]);

  const handleEditAddress = useCallback((address: AddressList) => {
    setEditingAddressId(address.id);
  }, []);

  const handleNotificationToggle = useCallback(
    (
      key: "stock_alerts_enabled" | "price_drop_alerts_enabled",
      value: boolean,
    ) => {
      if (!notificationPrefs) return;

      const updateData: PatchedNotificationPreferenceUpdate = {
        [key]: value,
      };

      updateNotificationPrefsMutation.mutate({
        id: notificationPrefs.id.toString(),
        data: updateData,
      });
    },
    [notificationPrefs, updateNotificationPrefsMutation],
  );

  useEffect(() => {
    if (fullAddressData) {
      setEditingAddress(fullAddressData);
    } else if (!editingAddressId) {
      setEditingAddress(null);
    }
  }, [fullAddressData, editingAddressId]);

  if (profileLoading || notificationPrefsLoading) {
    return <ScreenLoader />;
  }
  console.log("profile", profile);
  console.log("profileError", profileError);
  if (profileError || !profile) {
    return (
      <ErrorScreen
        title="Failed to load profile"
        message="We couldn't load your profile information. Please try again."
        onRetry={refetchProfile}
        onLogout={logout}
        showLogoutButton={true}
      />
    );
  }

  const allAddresses: AddressList[] = addressesAll || [];

  return (
    <ScreenWrapper showBackButton={false}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Card.Title
            title="Personal Information"
            right={() => (
              <Button mode="text" onPress={() => setShowEditProfile(true)}>
                Edit
              </Button>
            )}
          />
          <Card.Content>
            <Text variant="bodyMedium" style={styles.infoText}>
              <Text style={styles.label}>Name: </Text>
              {profile.first_name && profile.last_name
                ? `${profile.first_name} ${profile.last_name}`
                : "Not provided"}
            </Text>
            <Text variant="bodyMedium" style={styles.infoText}>
              <Text style={styles.label}>Phone: </Text>
              {profile.phone_number || "Not provided"}
            </Text>
            <Text variant="bodyMedium" style={styles.infoText}>
              <Text style={styles.label}>Date of Birth: </Text>
              {profile.date_of_birth || "Not provided"}
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Notification Preferences" />
          <Card.Content>
            {notificationPrefs ? (
              <View style={styles.preferenceItem}>
                <View style={styles.preferenceInfo}>
                  <Text variant="bodyMedium">Stock Alerts</Text>
                  <Text
                    variant="bodySmall"
                    style={styles.preferenceDescription}
                  >
                    Get notified when out-of-stock wishlist items become
                    available
                  </Text>
                </View>
                <Switch
                  value={notificationPrefs.stock_alerts_enabled || false}
                  onValueChange={(value) =>
                    handleNotificationToggle("stock_alerts_enabled", value)
                  }
                  disabled={updateNotificationPrefsMutation.isPending}
                />
              </View>
            ) : (
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                Loading notification preferences...
              </Text>
            )}

            {notificationPrefs && (
              <View style={styles.preferenceItem}>
                <View style={styles.preferenceInfo}>
                  <Text variant="bodyMedium">Price Drop Alerts</Text>
                  <Text
                    variant="bodySmall"
                    style={styles.preferenceDescription}
                  >
                    Get notified when wishlist items go on sale
                  </Text>
                </View>
                <Switch
                  value={notificationPrefs.price_drop_alerts_enabled || false}
                  onValueChange={(value) =>
                    handleNotificationToggle("price_drop_alerts_enabled", value)
                  }
                  disabled={updateNotificationPrefsMutation.isPending}
                />
              </View>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title
            title="Addresses"
            right={() => (
              <Button mode="text" onPress={() => setShowAddAddress(true)}>
                Add
              </Button>
            )}
          />
          <Card.Content>
            {allAddresses.length > 0 ? (
              <View style={styles.addressList}>
                {allAddresses.map((addr: AddressList) => (
                  <View key={addr.id} style={styles.addressItem}>
                    <View style={styles.addressInfo}>
                      <Text variant="bodyMedium">{addr.full_address}</Text>
                      {(addr.label || addr.is_default) && (
                        <Text variant="bodySmall" style={styles.addressMeta}>
                          {addr.label && `${addr.label} • `}
                          {addr.is_default && "Default"}
                        </Text>
                      )}
                    </View>
                    <Button mode="text" onPress={() => handleEditAddress(addr)}>
                      Edit
                    </Button>
                  </View>
                ))}
              </View>
            ) : (
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                No addresses added
              </Text>
            )}
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={logout}
          style={styles.logoutButton}
          icon="logout"
        >
          Logout
        </Button>
      </ScrollView>

      <FormDialog
        visible={showEditProfile}
        onDismiss={() => setShowEditProfile(false)}
      >
        <ProfileForm
          initialData={profile}
          onSubmit={handleProfileSubmit}
          isLoading={updateProfileMutation.isPending}
          submitText="Update Profile"
        />
      </FormDialog>

      <FormDialog
        visible={showAddAddress || !!editingAddress}
        onDismiss={() => {
          setShowAddAddress(false);
          setEditingAddressId(null);
          setEditingAddress(null);
        }}
      >
        {editingAddressId && addressLoading ? (
          <ScreenLoader />
        ) : (
          <AddressForm
            initialData={editingAddress}
            onSubmit={handleAddressSubmit}
            onDelete={editingAddress ? handleAddressDelete : undefined}
            isLoading={
              createAddressMutation.isPending ||
              updateAddressMutation.isPending ||
              deleteAddressMutation.isPending ||
              addressLoading
            }
            submitText={editingAddress ? "Update Address" : "Add Address"}
          />
        )}
      </FormDialog>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    marginBottom: 16,
    marginHorizontal: 8,
  },
  infoText: {
    marginBottom: 8,
  },
  label: {
    fontWeight: "600",
  },
  preferenceItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  preferenceInfo: {
    flex: 1,
    marginRight: 16,
  },
  preferenceDescription: {
    opacity: 0.7,
    marginTop: 4,
  },
  addressList: {
    gap: 16,
  },
  addressItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  addressInfo: {
    flex: 1,
    marginRight: 16,
  },
  addressMeta: {
    opacity: 0.7,
    marginTop: 4,
  },
  logoutButton: {
    marginHorizontal: 8,
    marginBottom: 32,
    marginTop: 24,
  },
});

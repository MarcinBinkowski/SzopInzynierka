import React from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Button, Text, useTheme, Chip } from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGeographicCountriesList } from "@/api/generated/shop/geographic/geographic";
import { Modal, Portal, List } from "react-native-paper";
import { profileAddressesCreateBody } from "@/api/generated/shop/profile/profile.zod";
import type { z } from "zod";

type AddressFormData = z.infer<typeof profileAddressesCreateBody>;

interface AddressFormProps {
  initialData?: Partial<AddressFormData>;
  onSubmit: (data: AddressFormData) => void;
  onDelete?: () => void;
  isLoading?: boolean;
  submitText?: string;
}

export function AddressForm({
  initialData,
  onSubmit,
  onDelete,
  isLoading = false,
  submitText = "Save Address",
}: AddressFormProps) {
  const theme = useTheme();
  const { data: countries } = useGeographicCountriesList();
  const [countryModalVisible, setCountryModalVisible] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(profileAddressesCreateBody),
    defaultValues: {
      address: initialData?.address || "",
      city: initialData?.city || "",
      postal_code: initialData?.postal_code || "",
      country: initialData?.country || 0,
      is_default: initialData?.is_default || false,
      label: initialData?.label || "",
    },
  });

  const countryOptions = countries || [];
  const isEditing = !!initialData;

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Address Information
      </Text>

      <Controller
        control={control}
        name="address"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Street Address *"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={!!errors.address}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={2}
          />
        )}
      />
      {errors.address && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {errors.address.message}
        </Text>
      )}

      <Controller
        control={control}
        name="city"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="City *"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={!!errors.city}
            style={styles.input}
            mode="outlined"
          />
        )}
      />
      {errors.city && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {errors.city.message}
        </Text>
      )}

      <Controller
        control={control}
        name="postal_code"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Postal Code *"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={!!errors.postal_code}
            style={styles.input}
            mode="outlined"
            keyboardType="default"
          />
        )}
      />
      {errors.postal_code && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {errors.postal_code.message}
        </Text>
      )}

      <Controller
        control={control}
        name="country"
        render={({ field: { onChange, value } }) => (
          <>
            <TextInput
              label="Country *"
              value={
                value
                  ? countryOptions.find((c) => c.id === value)?.name || ""
                  : ""
              }
              mode="outlined"
              placeholder="Select a country"
              onFocus={() => setCountryModalVisible(true)}
              right={
                <TextInput.Icon
                  icon="chevron-down"
                  onPress={() => setCountryModalVisible(true)}
                />
              }
              error={!!errors.country}
              editable={false}
              style={[styles.input, { fontSize: 14 }]}
            />

            <Portal>
              <Modal
                visible={countryModalVisible}
                onDismiss={() => setCountryModalVisible(false)}
                contentContainerStyle={{
                  backgroundColor: theme.colors.surface,
                  margin: 20,
                  borderRadius: 16,
                }}
              >
                <View style={{ padding: 8 }}>
                  <List.Section>
                    <List.Subheader>Select Country</List.Subheader>
                    <View style={{ maxHeight: 400 }}>
                      {countryOptions.map((country) => (
                        <List.Item
                          key={country.id}
                          title={country.name}
                          onPress={() => {
                            onChange(country.id);
                            setCountryModalVisible(false);
                          }}
                          right={(props) =>
                            value === country.id ? (
                              <List.Icon {...props} icon="check" />
                            ) : null
                          }
                        />
                      ))}
                    </View>
                  </List.Section>
                  <Button
                    mode="outlined"
                    onPress={() => setCountryModalVisible(false)}
                  >
                    Cancel
                  </Button>
                </View>
              </Modal>
            </Portal>
          </>
        )}
      />
      {errors.country && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {errors.country.message}
        </Text>
      )}

      <Controller
        control={control}
        name="label"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Label"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            style={styles.input}
            mode="outlined"
            placeholder="Home, Office..."
          />
        )}
      />

      <View style={styles.defaultSection}>
        <Controller
          control={control}
          name="is_default"
          render={({ field: { onChange, value } }) => (
            <Chip
              selected={value}
              onPress={() => onChange(!value)}
              mode={value ? "flat" : "outlined"}
              icon={value ? "check" : "plus"}
            >
              Set as default address
            </Chip>
          )}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
          disabled={isLoading}
          style={[
            styles.submitButton,
            isEditing && onDelete && styles.buttonInRow,
          ]}
        >
          {submitText}
        </Button>

        {isEditing && onDelete && (
          <Button
            mode="outlined"
            onPress={onDelete}
            disabled={isLoading}
            style={[styles.deleteButton, styles.buttonInRow]}
            buttonColor={theme.colors.errorContainer}
            textColor={theme.colors.error}
            icon="delete"
          >
            Delete
          </Button>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: "600",
  },
  typeSection: {
    marginBottom: 16,
  },
  typeLabel: {
    marginBottom: 8,
  },
  typeChips: {
    flexDirection: "row",
    gap: 8,
  },
  typeChip: {
    marginRight: 8,
  },
  input: {
    fontSize: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    marginBottom: 8,
    marginTop: -4,
  },
  defaultSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 16,
    flexDirection: "row",
    gap: 12,
  },
  submitButton: {
    flex: 1,
  },
  deleteButton: {
    flex: 1,
  },
  buttonInRow: {
    marginTop: 0,
  },
});

export default AddressForm;

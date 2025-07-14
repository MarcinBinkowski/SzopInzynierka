import React from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Button, Text, useTheme } from "react-native-paper";
import { DatePickerInput } from "react-native-paper-dates";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileProfilesPartialUpdateBody } from "@/api/generated/shop/profile/profile.zod";
import type { z } from "zod";

type ProfileFormData = z.infer<typeof profileProfilesPartialUpdateBody>;

interface ProfileFormProps {
  initialData?: Partial<ProfileFormData>;
  onSubmit: (data: ProfileFormData) => void;
  isLoading?: boolean;
  submitText?: string;
}

export function ProfileForm({
  initialData,
  onSubmit,
  isLoading = false,
  submitText = "Save Profile",
}: ProfileFormProps) {
  const theme = useTheme();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileProfilesPartialUpdateBody),
    defaultValues: {
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      phone_number: initialData?.phone_number || "",
      date_of_birth: initialData?.date_of_birth || null,
    },
  });

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Personal Information
      </Text>

      <Controller
        control={control}
        name="first_name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="First Name *"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={!!errors.first_name}
            style={styles.input}
            mode="outlined"
          />
        )}
      />
      {errors.first_name && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {errors.first_name.message}
        </Text>
      )}

      <Controller
        control={control}
        name="last_name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Last Name *"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={!!errors.last_name}
            style={styles.input}
            mode="outlined"
          />
        )}
      />
      {errors.last_name && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {errors.last_name.message}
        </Text>
      )}

      <Controller
        control={control}
        name="phone_number"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Phone Number"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={!!errors.phone_number}
            style={styles.input}
            mode="outlined"
            keyboardType="phone-pad"
            placeholder="+48 123 456 789"
          />
        )}
      />
      {errors.phone_number && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {errors.phone_number.message}
        </Text>
      )}

      <Controller
        control={control}
        name="date_of_birth"
        render={({ field: { onChange, value } }) => (
          <DatePickerInput
            locale="en"
            label="Date of Birth"
            value={value ? new Date(value) : undefined}
            onChange={(date) => {
              if (date) {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                onChange(`${year}-${month}-${day}`);
              } else {
                onChange(null);
              }
            }}
            inputMode="start"
            mode="outlined"
            style={[styles.input, styles.dateInput]}
            hasError={!!errors.date_of_birth}
          />
        )}
      />
      {errors.date_of_birth && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {errors.date_of_birth.message}
        </Text>
      )}

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        loading={isLoading}
        disabled={isLoading}
        style={styles.submitButton}
      >
        {submitText}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },

  sectionTitle: {
    marginBottom: 10,
    fontWeight: "600",
  },
  input: {
    marginBottom: 24,
  },
  dateInput: {
    marginTop: 60,
    marginBottom: 24,
  },
  errorText: {
    fontSize: 12,
    marginBottom: 24,
    marginTop: -8,
  },
  submitButton: {
    marginTop: 60,
  },
});

export default ProfileForm;

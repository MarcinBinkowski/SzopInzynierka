import { SelectModal } from '#/components/SelectModal';
import { useFormState } from '#/hooks/useFormState';
import { FormField } from '#/types/form';
import { Button, Icon, Input, Text } from '@rneui/themed';
import { useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

interface FormModalProps<T> {
  visible: boolean;
  title: string;
  fields: FormField<T>[];
  onClose: () => void;
  onSubmit: (data: Partial<T>) => void;
  initialValues?: Partial<T>;
  submitLabel?: string;
  cancelLabel?: string;
}

export function FormModal<T>({
  visible,
  title,
  fields,
  onClose,
  onSubmit,
  initialValues,
  submitLabel = 'Submit',
}: FormModalProps<T>) {
  const { state, handleChange, validateAll, hasErrors } = useFormState<T>(fields, initialValues, visible);

  const handleSubmit = () => {
    if (!validateAll()) return;

    const formattedValues = fields.reduce((acc, field) => ({
      ...acc,
      [field.name]: field.type === 'number'
        ? parseInt(state[field.name].value, 10)
        : state[field.name].value
    }), {});

    onSubmit(formattedValues as Partial<T>);
  };

  const renderField = (field: FormField<T>) => {
    if (field.type === 'select' && field.options) {
      const [isSelectVisible, setIsSelectVisible] = useState(false);
      const selectedOption = field.options.find(
        o => String(o.value) === state[field.name]?.value
      );

      return (
        <View key={String(field.name)} style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>{field.label}</Text>
          <TouchableOpacity
            onPress={() => setIsSelectVisible(true)}
            style={[
              styles.selectButton,
              state[field.name]?.error && styles.errorBorder
            ]}
          >
            <Text>{selectedOption?.label || field.placeholder}</Text>
            <Icon name="arrow-drop-down" />
          </TouchableOpacity>
          {state[field.name]?.error && (
            <Text style={styles.errorText}>{state[field.name].error}</Text>
          )}

          <SelectModal
            visible={isSelectVisible}
            title={field.label}
            options={field.options}
            selectedValue={selectedOption?.value}
            onSelect={(value) => handleChange(field, String(value))}
            onClose={() => setIsSelectVisible(false)}
          />
        </View>
      );
    }

    return (
      <Input
        key={String(field.name)}
        label={field.label}
        value={state[field.name]?.value || ''}
        onChangeText={(value) => handleChange(field, value)}
        placeholder={field.placeholder}
        keyboardType={field.keyboardType}
        errorMessage={state[field.name]?.error}
      />
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text h3 style={styles.modalTitle}>{title}</Text>
          
          {fields.map(field => renderField(field))}

          <View style={styles.buttonContainer}>
            <Button
              title="Cancel"
              onPress={onClose}
              type="outline"
              buttonStyle={styles.button}
            />
            <Button
              title={submitLabel}
              onPress={handleSubmit}
              buttonStyle={[styles.button, hasErrors() && styles.disabledButton]}
              disabled={hasErrors()}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 500,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    width: 120,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  fieldContainer: {
    marginHorizontal: 10,
    marginBottom: 15,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#86939e',
    marginBottom: 5,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#86939e',
    borderRadius: 4,
    padding: 10,
    height: 50,
  },
  errorBorder: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  }
});
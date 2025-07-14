import { SelectOption } from '#/types/form';
import { Button, Icon, ListItem, Text } from '@rneui/themed';
import { Modal, ScrollView, StyleSheet, View } from 'react-native';

interface SelectModalProps {
  visible: boolean;
  title: string;
  options: SelectOption[];
  selectedValue?: number;
  onSelect: (value: number) => void;
  onClose: () => void;
}

export function SelectModal({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose
}: SelectModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text h4 style={styles.modalTitle}>{title}</Text>
          
          <ScrollView style={styles.scrollView}>
            {options.map((option) => (
              <ListItem
                key={String(option.value)}
                onPress={() => {
                  onSelect(Number(option.value));
                  onClose();
                }}
                containerStyle={[
                  styles.listItem,
                  selectedValue === option.value && styles.selectedItem
                ]}
              >
                <ListItem.Content>
                  <ListItem.Title 
                    style={selectedValue === option.value && styles.selectedText}
                  >
                    {option.label}
                  </ListItem.Title>
                </ListItem.Content>
                {selectedValue === option.value && (
                  <Icon 
                    name="check" 
                    color="white" 
                  />
                )}
              </ListItem>
            ))}
          </ScrollView>

          <Button
            title="Cancel"
            onPress={onClose}
            type="outline"
            containerStyle={styles.buttonContainer}
          />
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
    maxHeight: '80%'
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 20
  },
  scrollView: {
    maxHeight: 400
  },
  listItem: {
    borderRadius: 8,
    marginVertical: 4
  },
  selectedItem: {
    backgroundColor: '#2089dc'
  },
  selectedText: {
    color: 'white'
  },
  buttonContainer: {
    marginTop: 20
  }
});
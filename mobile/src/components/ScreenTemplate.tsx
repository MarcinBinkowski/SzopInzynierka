import { Button, Icon, Text } from '@rneui/themed';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenTemplateProps {
  title: string;
  isLoading: boolean;
  onCreatePress: () => void;
  children: React.ReactNode;
}

export function ScreenTemplate({ title, isLoading, onCreatePress, children }: ScreenTemplateProps) {
  if (isLoading) {
    return (
      <SafeAreaView>
        <Text h4 style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView>
      <View style={styles.header}>
        <Text h2>{title}</Text>
        <Button
          title="Create New"
          icon={<Icon name="add" color="white" />}
          iconRight
          onPress={onCreatePress}
        />
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginVertical: 20,
  },
  title: {
    marginBottom: 0,
  },
  container: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
  },
});
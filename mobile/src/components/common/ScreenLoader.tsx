import { ActivityIndicator, View } from "react-native";
import { Text } from "react-native-paper";
import { ScreenWrapper } from "../layout/ScreenWrapper";

export default function ScreenLoader() {
  return (
    <ScreenWrapper>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text variant="bodyLarge" style={{ marginTop: 10 }}>
          Loading...
        </Text>
      </View>
    </ScreenWrapper>
  );
}

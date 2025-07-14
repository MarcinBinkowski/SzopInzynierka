import { Link, Stack } from "expo-router";
import { View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />
      <View>
        <Link href="/main">Go back to Home screen!</Link>
      </View>
    </>
  );
}

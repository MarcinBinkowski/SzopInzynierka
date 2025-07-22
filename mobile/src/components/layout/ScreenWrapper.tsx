import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "react-native-paper";
import { View, ViewStyle } from "react-native";

interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function ScreenWrapper({
  children,
  style,
}: ScreenWrapperProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        { flex: 1, backgroundColor: theme.colors.background, padding: 10 },
        style,
      ]}
    >
      {children}
    </View>
  );
}

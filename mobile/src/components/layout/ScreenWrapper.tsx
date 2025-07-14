import { useTheme, FAB } from "react-native-paper";
import { View, ViewStyle } from "react-native";
import { router } from "expo-router";

interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  showBackButton?: boolean;
}

export function ScreenWrapper({
  children,
  style,
  showBackButton = true,
}: ScreenWrapperProps) {
  const theme = useTheme();

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/main");
    }
  };

  return (
    <View
      style={[
        { flex: 1, backgroundColor: theme.colors.background, padding: 10 },
        style,
      ]}
    >
      {children}

      {showBackButton && (
        <FAB
          icon="arrow-left"
          onPress={handleBackPress}
          style={{
            position: "absolute",
            bottom: 20,
            left: 20,
          }}
        />
      )}
    </View>
  );
}

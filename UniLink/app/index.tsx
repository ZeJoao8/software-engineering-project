import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { colors } from "../styles/theme";
import { useAuth } from "../hooks/useAuth";

export default function Index() {
  const { user, isReady } = useAuth();

  if (!isReady) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return <Redirect href={user ? "/(tabs)/searchRide" : "/login"} />;
}

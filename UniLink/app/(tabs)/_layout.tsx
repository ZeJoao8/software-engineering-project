import { Pressable, Text } from "react-native";

import {
  Tabs,
  useRouter
} from "expo-router";

import { colors, radius } from "../../styles/theme";
import { NotificationBell } from "../../components/NotificationBell";

function CreateRideHeaderButton() {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push("/createRide")}
      testID="createRideHeaderButton"
      style={({ pressed }) => ({
        backgroundColor: colors.primarySoft,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: radius.sm,
        marginRight: 16,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Text
        style={{
          color: colors.primary,
          fontSize: 14,
          fontWeight: "700",
        }}
      >
        Create +
      </Text>
    </Pressable>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary
        },

        headerTitleStyle: {
          color: colors.primarySoft,
          fontWeight: "600"
        },

        headerTintColor: colors.primarySoft,

        headerLeft: () => <NotificationBell />,

        tabBarStyle: {
          backgroundColor: colors.primary,
          borderTopColor: "#e5e7eb"
        },

        tabBarActiveTintColor: colors.primarySoft,

        tabBarInactiveTintColor: colors.primaryDark
      }}
    >
      <Tabs.Screen
        name="searchRide"
        options={{
          title: "Rides",
          headerTitle: "Rides",
          tabBarButtonTestID: "ridesTab",
          headerRight: () => <CreateRideHeaderButton />
        }}
      />

      <Tabs.Screen
        name="myRides"
        options={{
          title: "My Rides",
          headerTitle: "My Rides",
          tabBarButtonTestID: "myRidesTab",
        }}
      />

      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Leaderboard",
          tabBarButtonTestID: "leaderboardTab"
        }}
      />

      <Tabs.Screen
        name="userProfile"
        options={{
          title: "Profile",
          tabBarButtonTestID: "profileTab"
        }}
      />

    </Tabs>
  );
}
import { Pressable, Text } from "react-native";

import {
  Tabs,
  useRouter
} from "expo-router";

import { colors } from "../../styles/theme";

function CreateRideHeaderButton() {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push("/(tabs)/createRide")}
      testID="createRideHeaderButton"
      style={{
        paddingHorizontal: 16,
        paddingVertical: 4
      }}
    >
      <Text
        style={{
          color: colors.primarySoft,
          fontSize: 30,
          fontWeight: "700",
          lineHeight: 32
        }}
      >
        +
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
        name="mapView"
        options={{
          title: "Map",
          tabBarButtonTestID: "mapTab"
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

      <Tabs.Screen
        name="createRide"
        options={{
          href: null,
          title: "Create Ride"
        }}
      />

      <Tabs.Screen
        name="myRides"
        options={{
          href: null,
          title: "My Rides"
        }}
      />
    </Tabs>
  );
}
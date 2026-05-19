import { useEffect, useState } from "react";
import { Pressable, Text } from "react-native";

import {
  Tabs,
  useRouter
} from "expo-router";

import { getPendingReceivedRequests, subscribeToFriendshipsChanges } from "../../data/friends";
import { colors } from "../../styles/theme";

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
        borderRadius: 8,
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
  const [pendingCount, setPendingCount] = useState(getPendingReceivedRequests().length);

  useEffect(() => {
    const unsub = subscribeToFriendshipsChanges(() => {
      setPendingCount(getPendingReceivedRequests().length);
    });
    return unsub;
  }, []);

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
          tabBarButtonTestID: "profileTab",
          tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
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
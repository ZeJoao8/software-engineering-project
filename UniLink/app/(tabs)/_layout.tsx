import { useEffect, useState } from "react";
import { Pressable, Text } from "react-native";

import {
  Tabs,
  useRouter
} from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { getPendingReceivedRequests, subscribeToFriendshipsChanges } from "../../store/friends";
import { getRideNotificationsCount, subscribeToNotificationsChanges } from "../../store/notifications";
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
  const [pendingCount, setPendingCount] = useState(getPendingReceivedRequests().length);
  const [rideNotifCount, setRideNotifCount] = useState(getRideNotificationsCount());

  useEffect(() => {
    const unsub = subscribeToFriendshipsChanges(() => {
      setPendingCount(getPendingReceivedRequests().length);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = subscribeToNotificationsChanges(() => {
      setRideNotifCount(getRideNotificationsCount());
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
          headerRight: () => <CreateRideHeaderButton />,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "search" : "search-outline"} size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="myRides"
        options={{
          title: "My Rides",
          headerTitle: "My Rides",
          tabBarButtonTestID: "myRidesTab",
          tabBarBadge: rideNotifCount > 0 ? rideNotifCount : undefined,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "car" : "car-outline"} size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Leaderboard",
          tabBarButtonTestID: "leaderboardTab",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "trophy" : "trophy-outline"} size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="userProfile"
        options={{
          title: "Profile",
          tabBarButtonTestID: "profileTab",
          tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
          ),
        }}
      />

    </Tabs>
  );
}
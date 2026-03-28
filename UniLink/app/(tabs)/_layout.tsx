import { Tabs } from "expo-router";

export default function TabsLayout() {

  return (

    <Tabs>

      <Tabs.Screen
        name="index"
        options={{
          title: "Rides"
        }}
      />

      <Tabs.Screen
        name="createRide"
        options={{
          title: "Create Ride"
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile"
        }}
      />

    </Tabs>

  );

}
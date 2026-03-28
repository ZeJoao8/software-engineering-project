import { Tabs } from "expo-router";

export default function TabsLayout() {

 return (

  <Tabs>

   <Tabs.Screen
    name="index"
    options={{ title: "Search" }}
   />

   <Tabs.Screen
    name="createRide"
    options={{ title: "Create" }}
   />

   <Tabs.Screen
    name="myRides"
    options={{ title: "My Rides" }}
   />

   <Tabs.Screen
    name="profile"
    options={{ title: "Profile" }}
   />

  </Tabs>

 );

}
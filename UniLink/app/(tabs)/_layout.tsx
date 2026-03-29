import { Tabs } from "expo-router";

export default function TabsLayout() {

 return (

  <Tabs>

   <Tabs.Screen
    name="searchRide"
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
    name="userProfile"
    options={{ title: "Profile" }}
   />

  </Tabs>

 );

}
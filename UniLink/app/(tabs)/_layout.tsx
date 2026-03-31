import { colors } from "../../styles/theme";
import { Tabs } from "expo-router";

export default function TabsLayout() {

 return (
    
  <Tabs

   screenOptions={{

    headerStyle:{
     backgroundColor: colors.primary
    },

    headerTitleStyle:{
     color: colors.primarySoft,      
     fontWeight:"600"
    },

    headerTintColor: colors.text, 

    tabBarStyle:{
     backgroundColor: colors.primary,
     borderTopColor:"#e5e7eb"
    },

    tabBarActiveTintColor: colors.primarySoft,

    tabBarInactiveTintColor:colors.primaryDark

   }}

  >

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
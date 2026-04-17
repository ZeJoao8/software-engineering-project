import { Tabs } from "expo-router";
import { colors } from "../../styles/theme";

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

                headerTintColor: colors.text,

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
                options={{ title: "Search", tabBarButtonTestID: "searchTab" }}
            />

            <Tabs.Screen
                name="mapView"
                options={{ title: "Map", tabBarButtonTestID: "mapTab" }}
            />

            <Tabs.Screen
                name="createRide"
                options={{ title: "Create", tabBarButtonTestID: "createTab" }}
            />

            <Tabs.Screen
                name="myRides"
                options={{ title: "My Rides", tabBarButtonTestID: "myRidesTab" }}
            />

            <Tabs.Screen
                name="userProfile"
                options={{ title: "Profile", tabBarButtonTestID: "profileTab" }}
            />
            

        </Tabs>

    );

}
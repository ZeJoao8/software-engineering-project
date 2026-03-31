import { Tabs } from "expo-router";

export default function TabsLayout() {

    return (

        <Tabs>

            <Tabs.Screen
                name="searchRide"
                options={{ title: "Search", tabBarButtonTestID: "searchTab" }}
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
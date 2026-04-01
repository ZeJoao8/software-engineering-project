import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import {
 getCurrentUser,
 isAuthReady,
 subscribeToAuthChanges,
 waitForAuthReady,
} from "../data/user";
import { colors } from "../styles/theme";

export default function Index(){

 const [ready, setReady] =
  useState(isAuthReady());

 const [user, setUser] =
  useState(getCurrentUser());

 useEffect(() => {
  let mounted = true;

  function syncState() {
   if (!mounted) return;
   setReady(isAuthReady());
   setUser(getCurrentUser());
  }

  syncState();

  const unsubscribe =
   subscribeToAuthChanges(syncState);

  void waitForAuthReady().then(syncState);

  return () => {
   mounted = false;
   unsubscribe();
  };
 }, []);

 if (!ready) {
  return (
   <View
    style={{
     flex: 1,
     alignItems: "center",
     justifyContent: "center",
    }}
   >
    <ActivityIndicator color={colors.primary} />
   </View>
  );
 }

 return (
  <Redirect
   href={
    user
     ? "/(tabs)/searchRide"
     : "/login"
   }
  />
 );

}

import {
 View,
 Text,
 FlatList,
 Pressable,
 StyleSheet
} from "react-native";

import {
 useRouter,
 useFocusEffect
} from "expo-router";

import {
 useState,
 useCallback
} from "react";

import { getRides } from "../../data/rides";
import { getCurrentUser } from "../../data/user";

export default function Home() {

 const router = useRouter();

 const [rides, setRides] =
  useState(getRides());

 const [user, setUser] =
  useState(getCurrentUser());

 useFocusEffect(
  useCallback(() => {

   setRides([...getRides()]);

   setUser(getCurrentUser());

  }, [])
 );

 const availableRides =
  rides.filter(r =>

   r.availableSeats > 0 &&
   r.driverId !== user.id

  );

 return (

  <View style={styles.container}>

   <Text style={styles.title}>
    Available Rides
   </Text>

   {availableRides.length === 0 && (

    <Text>
     No rides yet.
    </Text>

   )}

   <FlatList
    data={availableRides}
    keyExtractor={(item) => item.id}

    renderItem={({ item }) => (

     <Pressable

      style={styles.card}

      onPress={() =>
       router.push(`/ride/${item.id}`)
      }

     >

      <Text style={styles.route}>
       {item.origin} → {item.destination}
      </Text>

      <Text>
        {item.departureDateTime}
      </Text>

      <Text>
       Seats available:
       {" "}
       {item.availableSeats}
      </Text>

      {item.womenOnly && (

       <Text style={styles.tag}>
        Women only
       </Text>

      )}

     </Pressable>

    )}

   />

  </View>

 );

}

const styles = StyleSheet.create({

 container: {
  flex: 1,
  padding: 20
 },

 title: {
  fontSize: 22,
  fontWeight: "bold",
  marginBottom: 10
 },

 card: {
  borderWidth: 1,
  padding: 15,
  marginBottom: 10,
  borderRadius: 8
 },

 route: {
  fontWeight: "bold",
  fontSize: 16
 },

 tag: {
  marginTop: 5,
  color: "purple"
 }

});
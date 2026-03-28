import {

 View,
 Text,
 FlatList,
 StyleSheet

} from "react-native";

import {

 useFocusEffect

} from "expo-router";

import {

 useState,
 useCallback

} from "react";

import {

 getRides

} from "../../data/rides";

import {

 getCurrentUser

} from "../../data/user";

export default function MyRides() {

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

 const driverRides =
  rides.filter(

   r => r.driverId === user.id

  );

 const passengerRides =
  rides.filter(

   r => r.passengers.includes(user.id)

  );

 return (

  <View style={styles.container}>

   <Text style={styles.title}>
    Driver
   </Text>

   {driverRides.length === 0 && (

    <Text>
     No rides created yet
    </Text>

   )}

   <FlatList

    data={driverRides}

    keyExtractor={(item) => item.id}

    renderItem={({ item }) => (

     <View style={styles.card}>

      <Text style={styles.route}>
       {item.origin} → {item.destination}
      </Text>

      <Text>
       {item.departureDateTime}
      </Text>

      <Text>
       Seats left:
       {" "}
       {item.availableSeats}
      </Text>

     </View>

    )}

   />

   <Text style={styles.title}>
    Passenger
   </Text>

   {passengerRides.length === 0 && (

    <Text>
     No reservations yet
    </Text>

   )}

   <FlatList

    data={passengerRides}

    keyExtractor={(item) => item.id}

    renderItem={({ item }) => (

     <View style={styles.card}>

      <Text style={styles.route}>
       {item.origin} → {item.destination}
      </Text>

      <Text>
       {item.departureDateTime}
      </Text>

     </View>

    )}

   />

  </View>

 );

}

const styles = StyleSheet.create({

 container: {

  flex: 1,
  padding: 20,
  gap: 10

 },

 title: {

  fontSize: 20,
  fontWeight: "bold",
  marginTop: 15

 },

 card: {

  borderWidth: 1,
  padding: 10,
  marginVertical: 5,
  borderRadius: 8

 },

 route: {

  fontWeight: "bold"

 }

});
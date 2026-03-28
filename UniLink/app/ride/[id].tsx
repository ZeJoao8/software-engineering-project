import {
 View,
 Text,
 Button,
 StyleSheet
} from "react-native";

import {
 useLocalSearchParams,
 useRouter
} from "expo-router";

import {
 getRides,
 updateRide
} from "../../data/rides";

import {
 getCurrentUser
} from "../../data/user";

import { getCars } from "../../data/cars";

export default function RideDetails() {

 const router = useRouter();

 const params = useLocalSearchParams();

 // id pode vir undefined quando o screen é pré-carregado
 if (!params.id) {

  return null;

 }

 const id = Array.isArray(params.id)
  ? params.id[0]
  : params.id;

 const ride =
  getRides().find(r => r.id === id);

 if (!ride) {

  return null;

 }

 const car =
 getCars().find(
  c => c.id === ride.carId
 );
 <Text>
 Car:
 {" "}
 {car?.model} - {car?.color} ({car?.licensePlate})
</Text>

 function reserveSeat() {

  const user = getCurrentUser();

  if (
   ride.womenOnly &&
   user.gender !== "female"
  ) {

   alert(
    "Only female users can join this ride"
   );

   return;

  }

  if (ride.availableSeats <= 0) {

   alert("Ride is full");

   return;

  }

  updateRide({

   ...ride,

   availableSeats:
    ride.availableSeats - 1,

   passengers: [

    ...ride.passengers,

    user.id

   ]

  });

  router.replace("/(tabs)");

 }

 function formatDate(iso: string) {

  const d = new Date(iso);

  return (
   d.toLocaleDateString()
   +
   " "
   +
   d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
   })
  );

 }

 return (

  <View style={styles.container}>

   <Text style={styles.title}>

    {ride.origin} → {ride.destination}

   </Text>

   <Text>

    {formatDate(
     ride.departureDateTime
    )}

   </Text>

   <Text>

    Seats:
    {" "}
    {ride.availableSeats}

   </Text>

   <Text>

    Women only:
    {" "}
    {ride.womenOnly ? "Yes" : "No"}

   </Text>

   <Button

    title="Reserve seat"

    onPress={reserveSeat}

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

  fontSize: 22,
  fontWeight: "bold"

 }
 

});
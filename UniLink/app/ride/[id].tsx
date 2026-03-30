import {
 View,
 Text,
 Button,
 StyleSheet,
 Alert
} from "react-native";

import {
 useLocalSearchParams,
 useRouter
} from "expo-router";

import {
 getRides,
 updateRide,
 deleteRide
} from "../../data/rides";

import {
 getCurrentUser,
 getUsers
} from "../../data/user";

import {
 getCars
} from "../../data/cars";

import { formatDate
} from "../../utils/date";

export default function RideDetails(){

 const router = useRouter();

 const params = useLocalSearchParams();

 const id =
  typeof params.id === "string"
   ? params.id
   : undefined;

 const ride =
  id
   ? getRides().find(r => r.id === id)
   : undefined;

 if(!ride) return null;

 const r=ride;

 const user = getCurrentUser();

 const users = getUsers();

 const cars = getCars();

 const driver =
  users.find(
   u => u.id === r.driverId
  );

 const car =
  cars.find(
   c => c.id === r.carId
  );

 const passengers =
  ride.passengers
   .map(id =>
    users.find(
     u => u.id === id
    )
   )
   .filter(Boolean);

 const isDriver =
  r.driverId === user.id;

 const joined =
  r.passengers.includes(user.id);

 const rideDate =
  new Date(r.departureDateTime);

 const now =
  new Date();

 const rideStarted =
  rideDate < now;

 const canComplete =
  isDriver &&
  rideStarted &&
  !r.completed;

 function reserveSeat(){

  if(r.completed){
   alert("Ride already completed");
   return;
  }

  if(rideStarted){
   alert("Ride already started");
   return;
  }

  if(
   r.womenOnly &&
   user.gender !== "female"
  ){
   alert("Only women allowed");
   return;
  }

  if(r.availableSeats <= 0){
   alert("Ride full");
   return;
  }

  updateRide({
   ...r,
   availableSeats:
    r.availableSeats - 1,
   passengers:[
    ...r.passengers,
    user.id
   ]
  });

  router.replace("/(tabs)/myRides");
 }

 function cancelSeat(){
  if(rideStarted || r.completed){
   alert("Cannot cancel now");
   return;
  }

  const newSeats =
   Math.min(
    r.availableSeats + 1,
    r.totalSeats
   );

  updateRide({
   ...r,
   availableSeats:newSeats,
   passengers:
    r.passengers.filter(
     p => p !== user.id
    )
  });
  router.replace("/(tabs)/myRides");
 }

 function cancelRide(){
  Alert.alert(
   "Cancel ride",
   "Are you sure you want to cancel this ride?",
   [
    {
     text:"No"
    },
    {
     text:"Yes",
     onPress:()=>{
      deleteRide(r.id);
      router.replace("/(tabs)/myRides");
     }
    }
   ]
  );
 }

 function completeRide(){
  updateRide({
   ...r,
   completed:true
  })
  router.replace("/(tabs)/myRides");
 }

 return(
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
    {
     ride.totalSeats -
     ride.availableSeats
    }
    {" / "}
    {ride.totalSeats}
   </Text>

   {ride.womenOnly && (
    <Text style={styles.tag}>
     Women only
    </Text>
   )}

   <Text style={styles.section}>
    Driver
   </Text>

   <Text>
    {driver?.name}
   </Text>

   <Text style={styles.section}>
    Car
   </Text>

   <Text>
    {car?.model}
   </Text>

   <Text>
    {car?.color}
   </Text>

   <Text>
    {car?.licensePlate}
   </Text>

   <Text style={styles.section}>
    Passengers
   </Text>

   {passengers.length === 0 && (
    <Text>
     No passengers yet
    </Text>
   )}

   {passengers.map(p => (
    <Text key={p!.id}>
     {p!.name}
    </Text>
   ))}

   {ride.completed && (
    <Text style={styles.completed}>
     Completed
    </Text>
   )}

   {!isDriver && !joined && !rideStarted && !ride.completed && (
    <Button
     title="Reserve seat"
     onPress={reserveSeat}
    />
   )}

   {joined && !isDriver && !rideStarted && !ride.completed && (
    <Button
     title="Cancel reservation"
     onPress={cancelSeat}
    />
   )}

   {isDriver && !rideStarted && !ride.completed && (
    <Button
     title="Cancel ride"
     onPress={cancelRide}
    />
   )}

   {canComplete && (
    <Button
     title="Complete ride"
     onPress={completeRide}
    />
   )}
  </View>
 );
}

const styles = StyleSheet.create({

 container:{
  flex:1,
  padding:20,
  gap:10
 },

 title:{
  fontSize:22,
  fontWeight:"bold"
 },

 section:{
  marginTop:15,
  fontWeight:"bold"
 },

 completed:{
  color:"green",
  fontWeight:"bold"
 },

 tag:{
  marginTop:5,
  color:"purple"
 }

});
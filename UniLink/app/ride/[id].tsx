import {
 View,
 Text,
 Button,
 StyleSheet,
 Alert
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

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

import { Picker } from "@react-native-picker/picker";
import { useState } from "react";

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
   u => u.email === r.driverId
  );

 const car =
  cars.find(
   c => c.id === r.carId
  );

 const passengers =
  ride.passengers
   .map(id =>
    users.find(
     u => u.email === id
    )
   )
   .filter(Boolean);

 const isDriver =
  r.driverId === user.email;

 const joined =
  r.passengers.includes(user.email);

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

const driverCars =
 cars.filter(
  c => c.ownerId === user.email
 );

const [editingCar,setEditingCar] =
 useState(false);

const [selectedCarId,setSelectedCarId] =
 useState(r.carId);

function reserveSeat(){
 if(r.completed){
  Alert.alert(
   "Cannot reserve",
   "This ride is already completed."
  );
  return;
 }

 if(rideStarted){
  Alert.alert(
   "Cannot reserve",
   "This ride has already started."
  );
  return;
 }
 if(r.womenOnly && user.gender !== "female"
 ){
  Alert.alert(
   "Not allowed",
   "This ride is restricted to women only."
  );
  return;
 }
 if(r.availableSeats <= 0){
  Alert.alert(
   "Ride full",
   "There are no seats available."
  );
  return;
 }
 Alert.alert(
  "Reserve seat",
  "Confirm reservation for this ride?",
  [
   {
    text:"No",
    style:"cancel"
   },
   {
    text:"Yes",
    onPress:()=>{
     updateRide({
      ...r,
      availableSeats:
       r.availableSeats - 1,
      passengers:[
       ...r.passengers,
       user.email
      ]
     });
     router.replace("/(tabs)/myRides");
    }
   }
  ]
 );
}

function cancelSeat(){
 if(rideStarted || r.completed){
  Alert.alert(
   "Cannot cancel",
   "This ride has already started or is completed."
  );
  return;
 }
 Alert.alert(
  "Cancel reservation",
  "Are you sure you want to cancel your seat?",
  [
   {
    text:"No",
    style:"cancel"
   },
   {
    text:"Yes",
    style:"destructive",
    onPress:()=>{
     const newSeats =
      Math.min(r.availableSeats + 1,r.totalSeats);
     updateRide({
      ...r,
      availableSeats:newSeats,
      passengers:
       r.passengers.filter(
        p => p !== user.email
       )
     });
     router.replace("/(tabs)/myRides");
    }
   }
  ]
 );
}

function cancelRide(){
 if(rideStarted || r.completed){
  Alert.alert(
   "Cannot cancel",
   "This ride has already started or is completed."
  );
  return;
 }
 Alert.alert(
  "Cancel ride",
  "Are you sure you want to cancel this ride?",
  [
   {
    text:"No",
    style:"cancel"
   },
   {
    text:"Yes",
    style:"destructive",
    onPress:()=>{
     deleteRide(r.id);
     router.replace("/(tabs)/myRides");
    }
   }
  ]
 );
}

function completeRide(){
 if(!canComplete){
  Alert.alert(
   "Cannot complete",
   "Ride cannot be completed yet."
  );
  return;
 }
 Alert.alert(
  "Complete ride",
  "Mark this ride as completed?",
  [
   {
    text:"No",
    style:"cancel"
   },
   {
    text:"Yes",
    onPress:()=>{
     updateRide({
      ...r,
      completed:true
     });
     router.replace("/(tabs)/myRides");
    }
   }
  ]
 );
}

function removePassenger(passengerId:string){
 if(rideStarted || r.completed){
  Alert.alert(
   "Cannot remove",
   "Ride already started or completed."
  );
  return;
 }
 Alert.alert(
  "Remove passenger",
  "Remove this passenger from the ride?",
  [
   {
    text:"No",
    style:"cancel"
   },
   {
    text:"Yes",
    style:"destructive",
    onPress:()=>{
     updateRide({
      ...r,
      passengers:
       r.passengers.filter(
        id => id !== passengerId
       ),
      availableSeats:
       Math.min(
        r.availableSeats + 1,
        r.totalSeats
       )
     });
     router.replace(`/ride/${r.id}`);
    }
   }
  ]
 );
}

function changeCar(){
 const newCar =
  driverCars.find(
   c => c.id === selectedCarId
  );
 if(!newCar) return;
 const newCarMaxPassengers =
  newCar.seatCapacity - 1;
 const currentRideLimit =
  r.totalSeats;
 const newRideLimit =
  Math.min(
   currentRideLimit,
   newCarMaxPassengers
  );
 if(passengers.length > newRideLimit){
  Alert.alert(
   "Car too small",
   `Current passengers exceed capacity of selected car (max ${newRideLimit}).`
  );
  return;
 }
 Alert.alert(
  "Change car",
  "Confirm car change?",
  [
   {
    text:"No",
    style:"cancel"
   },
   {
    text:"Yes",
    onPress:()=>{
     updateRide({
      ...r,
      carId:newCar.id,
      totalSeats:newRideLimit,
      availableSeats:
       newRideLimit -
       passengers.length
     });
     setEditingCar(false);
     router.replace(`/ride/${r.id}`);
    }
   }
  ]
 );
}

 return(
  <SafeAreaView style={styles.container}>

    <Text
    style={styles.back}
    onPress={()=> router.back()}
    >
    ← Back
    </Text>

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

    <Text
    style={styles.link}
    onPress={() =>{
      if(driver?.email === user?.email) router.push("/(tabs)/userProfile");
      else router.push(`/user/${driver?.email}`)
    }
    }
    >
    {driver?.name}
    </Text>

    <Text style={styles.section}>
    Car
    </Text>
    {car ? (
    <>
      <Text>
      {car.model}
      </Text>
      <Text>
      {car.color}
      </Text>
      <Text>
      {car.licensePlate}
      </Text>
    </>
    ) : (
    <Text>
      Vehicle information unavailable
    </Text>
    )}

   <Text style={styles.section}>
    Passengers
   </Text>

   {passengers.length === 0 && (
    <Text>
     No passengers yet
    </Text>
   )}

{passengers.map(p => (
 <View
  key={p!.email}
  style={styles.passengerRow}
 >
  <Text
  style={styles.link}
  onPress={() =>{
    if(p!.email===user.email) router.push("/(tabs)/userProfile");
    else router.push(`/user/${p!.email}`)
  }
  }
  >
  {p!.name}
  </Text>
  {isDriver && !rideStarted && !ride.completed && (
   <Text
    style={styles.remove}
    onPress={() =>
     removePassenger(p!.email)
    }
   >
    remove
   </Text>
  )}
 </View>
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

  {isDriver && !rideStarted && !ride.completed && !editingCar && driverCars.length > 1 && (
    <Button
    title="Change car"
    onPress={()=> setEditingCar(true)}
  />
  )}
{editingCar && (
 <>
  <Text style={styles.section}>
   Select new car
  </Text>
  <Picker
   selectedValue={selectedCarId}
   onValueChange={setSelectedCarId}
  >
   {driverCars.map(c=>(
    <Picker.Item
     key={c.id}
     label={`${c.model} (${c.licensePlate})`}
     value={c.id}
    />
   ))}
  </Picker>
  <Button
   title="Save car"
   onPress={changeCar}
  />
  <Button
   title="Cancel"
   onPress={()=>
    setEditingCar(false)
   }
  />
 </>
)}
   {isDriver && !rideStarted && !ride.completed && !editingCar && (
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
  </SafeAreaView>
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
 },

 back:{
 fontSize:16,
 marginBottom:10,
 color:"blue"
},

passengerRow:{
 flexDirection:"row",
 justifyContent:"space-between",
 alignItems:"center"
},

remove:{
 color:"red"
},

link:{
 color:"blue"
},
});
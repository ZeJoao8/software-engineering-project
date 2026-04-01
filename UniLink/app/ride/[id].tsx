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

import { components } from "../../styles/components";
import { layout } from "../../styles/layout";
import { colors, spacing } from "../../styles/theme";

import RouteMap from "../../components/RouteMap";

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

 const user = getCurrentUser();

 const [editingCar,setEditingCar] =
  useState(false);

 const [selectedCarId,setSelectedCarId] =
  useState(ride?.carId || "");

 if(!ride || !user) return null;

 const r=ride;

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
 if(r.womenOnly && user!.gender !== "Female"
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
       user!.email
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
        p => p !== user!.email
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

<SafeAreaView style={layout.screen}>

<Text
 style={{
  color:colors.primary,
  marginBottom:spacing.sm,
  fontWeight:"600"
 }}

 onPress={()=> router.back()}
>
 ← Back
</Text>



{/* ROUTE */}
<View style={components.card}>

<Text style={layout.title}>
 {ride.origin} → {ride.destination}
</Text>

<Text style={{
 marginBottom:spacing.sm
}}>
 {formatDate(ride.departureDateTime)}
</Text>


<Text style={{fontWeight:"500", color:colors.textLight}}>

 {ride.totalSeats - ride.availableSeats}
 {" / "}
 {ride.totalSeats}
 {" seats"}

</Text>


<View style={{
 flexDirection:"row",
 gap:8,
 marginTop:spacing.sm
}}>


{ride.womenOnly && (

<Text style={{
 backgroundColor:"#fce7f3",
 color:colors.women,
 paddingHorizontal:8,
 paddingVertical:3,
 borderRadius:6,
 fontSize:12,
 fontWeight:"600"
}}>
 women only
</Text>

)}


{ride.completed && (

<Text style={{
 backgroundColor:"#dcfce7",
 color:colors.primaryDark,
 paddingHorizontal:8,
 paddingVertical:3,
 borderRadius:6,
 fontSize:12,
 fontWeight:"600"
}}>
 Completed
</Text>

)}

</View>

{r.originCoords && r.destinationCoords && (
  <View style={{ marginTop: spacing.md }}>
    <RouteMap
      origin={r.originCoords}
      destination={r.destinationCoords}
      originName={r.origin}
      destinationName={r.destination}
    />
  </View>
)}

</View>



{/* DRIVER */}
<View style={components.card}>

<Text style={layout.subtitle}>
 Driver
</Text>

<Text
 style={{color:colors.primary,fontWeight:"600"}}

 onPress={()=>{

  if(driver?.email === user!.email)

   router.push("/(tabs)/userProfile");

  else

   router.push(`/user/${driver?.email}`);

 }}
>
 {driver?.name}
</Text>

</View>



{/* CAR */}
<View style={components.card}>

<Text style={layout.subtitle}>
 Car
</Text>

{car ? (

<>

<Text>
 {car.model}
</Text>

<Text style={{color:colors.textLight}}>
 {car.color}
</Text>

<Text style={{fontWeight:"600", paddingBottom:spacing.sm}}>
 {car.licensePlate}
</Text>
{isDriver && !rideStarted && !ride.completed && !editingCar && driverCars.length > 1 && (


<View style={components.outlineButton}>

<Text
 style={components.outlineButtonText}
 onPress={()=> setEditingCar(true)}
>

 Change car

</Text>

</View>


)}

</>

) : (

<Text style={{color:colors.textLight}}>
 Vehicle unavailable
</Text>

)}

</View>



{/* PASSENGERS */}
<View style={components.card}>

<Text style={layout.subtitle}>
 Passengers
</Text>


{passengers.length === 0 && (

<Text style={{color:colors.textLight}}>
 No passengers yet
</Text>

)}


{passengers.map(p => (

<View
 key={p!.email}

 style={{
  flexDirection:"row",
  justifyContent:"space-between",
  alignItems:"center",
  marginBottom:spacing.sm
 }}
>

<Text
 style={{color:colors.primary, fontWeight:"500"}}

 onPress={()=>{

  if(p!.email === user!.email)

   router.push("/(tabs)/userProfile");

  else

   router.push(`/user/${p!.email}`);

 }}
>

 {p!.name}

</Text>



{isDriver && !rideStarted && !ride.completed && (

<Text
 style={{
  color:colors.danger,
  fontWeight:"600"
 }}

 onPress={() =>
  removePassenger(p!.email)
 }
>

 remove

</Text>

)}

</View>

))}

</View>


{/* CHANGE CAR */}
{editingCar && (

<View style={components.card}>

<Text style={layout.subtitle}>
 Select new car
</Text>


<View style={components.pickerWrapper}>

<Picker
 selectedValue={selectedCarId}
 onValueChange={setSelectedCarId}

 dropdownIconColor={colors.primary}

 style={{
  color:colors.primary,
  fontWeight:"600"
 }}
>

{driverCars.map(c=>(

<Picker.Item
 key={c.id}
 label={`${c.model} (${c.licensePlate})`}
 value={c.id}
 style={{color:"black"}}
/>

))}

</Picker>

</View>


<View style={{height:spacing.sm}} />


<View style={components.button}>

<Text
 style={components.buttonText}
 onPress={changeCar}
>

 Save car

</Text>

</View>


<View style={{height:spacing.sm}} />


<View style={components.outlineButton}>

<Text
 style={components.outlineButtonText}
 onPress={()=> setEditingCar(false)}
>

 Cancel

</Text>

</View>

</View>

)}



{/* PASSENGER ACTIONS */}
{!isDriver && !joined && !rideStarted && !ride.completed && (

<View style={components.button}>

<Text
 style={components.buttonText}
 onPress={reserveSeat}
>

 Reserve seat

</Text>

</View>

)}



{joined && !isDriver && !rideStarted && !ride.completed && (

<View style={components.button}>

<Text
 style={components.buttonText}
 onPress={cancelSeat}
>

 Cancel reservation

</Text>

</View>

)}



{/* DRIVER CONTROLS */}
{isDriver && !rideStarted && !ride.completed && !editingCar && (

<View style={components.button}>

<Text
 style={components.buttonText}
 onPress={cancelRide}
>

 Cancel ride

</Text>

</View>

)}



{canComplete && (

<View style={components.button}>

<Text
 style={components.buttonText}
 onPress={completeRide}
>

 Complete ride

</Text>

</View>

)}


</SafeAreaView>

);
}
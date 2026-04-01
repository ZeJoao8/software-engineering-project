import {
 View,
 Text,
 Alert,
 Pressable
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
 getUserById
} from "../../data/user";

import {
 getCars
} from "../../data/cars";

import { formatDate
} from "../../utils/date";

import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";

import { components } from "../../styles/components";
import { layout } from "../../styles/layout";
import { colors, spacing } from "../../styles/theme";

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

 const [editingCar,setEditingCar] =
  useState(false);

 const [selectedCarId,setSelectedCarId] =
  useState<string | undefined>(ride?.carId);

 useEffect(() => {
  setSelectedCarId(ride?.carId);
 }, [ride?.carId]);

 if(!ride) return null;

 const r=ride;

 const user = getCurrentUser();

 if(!user) return null;

 const activeUser = user;

 const cars = getCars();

 const driver =
  getUserById(r.driverId);

 const car =
  cars.find(
   c => c.id === r.carId
  );

 const passengers =
  ride.passengers
   .map(id =>
    getUserById(id)
   )
   .filter(Boolean);

 const isDriver =
  r.driverId === activeUser.uid ||
  r.driverId === activeUser.email;

 const joined =
  r.passengers.includes(activeUser.uid) ||
  r.passengers.includes(activeUser.email);

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
  c =>
   c.ownerId === activeUser.uid ||
   c.ownerId === activeUser.email
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
 if(r.womenOnly && activeUser.gender !== "Female"
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
     onPress: async ()=>{
      await updateRide({
      ...r,
      availableSeats:
       r.availableSeats - 1,
      passengers:[
       ...r.passengers,
       activeUser.uid
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
     onPress: async ()=>{
      const newSeats =
       Math.min(r.availableSeats + 1,r.totalSeats);
      await updateRide({
      ...r,
      availableSeats:newSeats,
      passengers:
       r.passengers.filter(
         p =>
          p !== activeUser.uid &&
          p !== activeUser.email
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
     onPress: async ()=>{
      await deleteRide(r.id);
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
     onPress: async ()=>{
      await updateRide({
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
     onPress: async ()=>{
      await updateRide({
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
     onPress: async ()=>{
      await updateRide({
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

</View>



{/* DRIVER */}
<View style={components.card}>

<Text style={layout.subtitle}>
 Driver
</Text>

<Text
 style={{color:colors.primary,fontWeight:"600"}}

 onPress={()=>{

  if(driver?.uid === activeUser.uid)

   router.push("/(tabs)/userProfile");

  else

   router.push(`/user/${driver?.uid}`);

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


<Pressable style={components.outlineButton}  
  onPress={()=> setEditingCar(true)}
>
<Text
 style={components.outlineButtonText}
>
 Change car
</Text>
</Pressable>


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
 key={p!.uid}

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

  if(p!.uid === activeUser.uid)

   router.push("/(tabs)/userProfile");

  else

   router.push(`/user/${p!.uid}`);

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
  removePassenger(p!.uid)
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


<Pressable style={components.button}  onPress={changeCar}>

<Text
 style={components.buttonText}
>
 Save car
</Text>

</Pressable>


<View style={{height:spacing.sm}} />


<Pressable style={components.outlineButton}
  onPress={()=> setEditingCar(false)}
>
<Text
 style={components.outlineButtonText}
>
 Cancel
</Text>
</Pressable>
</View>

)}



{/* PASSENGER ACTIONS */}
{!isDriver && !joined && !rideStarted && !ride.completed && (

<Pressable style={components.button}  onPress={reserveSeat}>
<Text
 style={components.buttonText}
>

 Reserve seat

</Text>

</Pressable>

)}



{joined && !isDriver && !rideStarted && !ride.completed && (
<Pressable style={components.button}  onPress={cancelSeat}>
<Text
 style={components.buttonText}
>
 Cancel reservation
</Text>
</Pressable>
)}



{/* DRIVER CONTROLS */}
{isDriver && !rideStarted && !ride.completed && !editingCar && (

<Pressable style={components.button}  onPress={cancelRide}>
<Text
 style={components.buttonText}
>
 Cancel ride
</Text>
</Pressable>

)}



{canComplete && (

<Pressable style={components.button}  onPress={completeRide}>
<Text
 style={components.buttonText}
>
 Complete ride
</Text>
</Pressable>

)}


</SafeAreaView>

);
}

import {
 View,
 Text,
 Alert,
 Pressable,
 ScrollView
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import {
 getRides,
 updateRide,
 deleteRide
} from "../../data/rides";

import {
 getCurrentUser,
 getUserById
} from "../../data/user";

import { getCars } from "../../data/cars";

import { hasReviewForRide } from "../../data/reviews";

import { formatDate } from "../../utils/date";

import { Picker } from "@react-native-picker/picker";

import { useEffect, useState } from "react";

import { components } from "../../styles/components";
import { layout } from "../../styles/layout";

import {
 colors,
 spacing
} from "../../styles/theme";

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

 const [editingCar,setEditingCar] =
  useState(false);

 const [selectedCarId,setSelectedCarId] =
  useState<string | undefined>(ride?.carId);

 useEffect(() => {
  setSelectedCarId(ride?.carId);
 }, [ride?.carId]);

 if(!ride) return null;

 const r = ride;

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
  !r.completed;

 const canRateDriver =
  joined &&
  !isDriver &&
  r.completed &&
  !hasReviewForRide(
   r.id,
   activeUser.uid,
   driver?.uid ?? r.driverId,
   activeUser.email,
   r.driverId
  );

 const driverCars =
  cars.filter(
   c =>
    c.ownerId === activeUser.uid ||
    c.ownerId === activeUser.email
  );


 function reserveSeat(){

  if(r.completed)
   return Alert.alert(
    "Cannot reserve",
    "Ride already completed."
   );

  if(rideStarted)
   return Alert.alert(
    "Cannot reserve",
    "Ride already started."
   );

  if(r.womenOnly && activeUser.gender !== "Female")
   return Alert.alert(
    "Not allowed",
    "Ride restricted to women."
   );

  if(r.availableSeats <= 0)
   return Alert.alert(
    "Ride full",
    "No seats available."
   );

  Alert.alert(
   "Reserve seat",
   "Confirm reservation?",
   [
    { text:"No", style:"cancel" },

    {
     text:"Yes",

     onPress: async () => {

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

  if(rideStarted || r.completed)
   return Alert.alert(
    "Cannot cancel",
    "Ride already started."
   );

  Alert.alert(
   "Cancel reservation",
   "Cancel your seat?",
   [
    { text:"No",style:"cancel" },

    {
     text:"Yes",
     style:"destructive",

     onPress: async () => {

      await updateRide({

       ...r,

       availableSeats:
        Math.min(
         r.availableSeats + 1,
         r.totalSeats
        ),

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

  if(rideStarted || r.completed)
   return Alert.alert(
    "Cannot cancel",
    "Ride already started."
   );

  Alert.alert(
   "Cancel ride",
   "Are you sure?",
   [
    { text:"No",style:"cancel" },

    {
     text:"Yes",
     style:"destructive",

     onPress: async () => {

      await deleteRide(r.id);

      router.replace("/(tabs)/myRides");

     }

    }

   ]
  );

 }


 function completeRide(){

  if(!canComplete)
   return Alert.alert(
    "Cannot complete",
    "Ride cannot be completed yet."
   );

  Alert.alert(
   "Complete ride",
   "Mark as completed?",
   [
    { text:"No",style:"cancel" },

    {
     text:"Yes",

     onPress: async () => {

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

  if(rideStarted || r.completed)
   return Alert.alert(
    "Cannot remove",
    "Ride already started."
   );

  Alert.alert(
   "Remove passenger",
   "Remove passenger?",
   [
    { text:"No",style:"cancel" },

    {
     text:"Yes",
     style:"destructive",

     onPress: async () => {

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

  const newLimit =
   Math.min(
    r.totalSeats,
    newCar.seatCapacity - 1
   );

  if(passengers.length > newLimit)
   return Alert.alert(
    "Car too small"
   );

  Alert.alert(
   "Change car",
   "Confirm?",
   [
    {text:"No",style:"cancel"},

    {
     text:"Yes",

     onPress: async ()=>{

      await updateRide({

       ...r,

       carId:newCar.id,

       totalSeats:newLimit,

       availableSeats:
        newLimit-passengers.length

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

<ScrollView
 showsVerticalScrollIndicator={false}
 contentContainerStyle={{
  paddingBottom: spacing.xl
 }}
>

<Text
 style={{
  color:colors.primary,
  marginBottom:spacing.sm,
  fontWeight:"600"
 }}
 onPress={()=>router.back()}
>
 ← Back
</Text>



<View style={components.card}>

<Text style={layout.title}>
 {ride.origin} → {ride.destination}
</Text>

<Text style={{marginBottom:spacing.sm}}>
 {formatDate(ride.departureDateTime)}
</Text>

<Text style={{
 fontWeight:"500",
 color:colors.textLight
}}>
 {ride.totalSeats-ride.availableSeats}
 {" / "}
 {ride.totalSeats}
 {" seats"}
</Text>

</View>



{ride.originCoords && ride.destinationCoords && (

<View style={[components.card,{padding:0}]}>

<RouteMap
 origin={ride.originCoords}
 destination={ride.destinationCoords}
 originLabel={ride.origin}
 destinationLabel={ride.destination}
 height={220}
 interactive
/>

</View>

)}



<View style={components.card}>

<Text style={layout.subtitle}>
 Driver
</Text>

<Text
 style={{
  color:colors.primary,
  fontWeight:"600"
 }}

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

<Text style={{
 fontWeight:"600",
 paddingBottom:spacing.sm
}}>
 {car.licensePlate}
</Text>


{isDriver && !rideStarted && !r.completed && !editingCar && driverCars.length > 1 && (

<Pressable
 style={components.outlineButton}
 onPress={()=>setEditingCar(true)}
>
<Text style={components.outlineButtonText}>
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
  marginBottom:spacing.sm
 }}
>

<Text
 style={{
  color:colors.primary,
  fontWeight:"500"
 }}

 onPress={()=>{

  if(p!.uid === activeUser.uid)

   router.push("/(tabs)/userProfile");

  else

   router.push(`/user/${p!.uid}`);

 }}
>
 {p!.name}
</Text>



{isDriver && !rideStarted && !r.completed && (

<Text
 style={{
  color:colors.danger,
  fontWeight:"600"
 }}

 onPress={()=>removePassenger(p!.uid)}
>
 remove
</Text>

)}


</View>

))}

</View>



{editingCar && (

<View style={components.card}>

<Text style={layout.subtitle}>
 Select new car
</Text>

<View style={components.pickerWrapper}>

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

</View>


<View style={{height:spacing.sm}} />


<Pressable
 style={components.button}
 onPress={changeCar}
>

<Text style={components.buttonText}>
 Save car
</Text>

</Pressable>


<View style={{height:spacing.sm}} />


<Pressable
 style={components.outlineButton}
 onPress={()=>setEditingCar(false)}
>

<Text style={components.outlineButtonText}>
 Cancel
</Text>

</Pressable>

</View>

)}



{!isDriver && !joined && !rideStarted && !r.completed && (

<Pressable
 style={[components.button,{marginTop:spacing.md}]}
 onPress={reserveSeat}
>
<Text style={components.buttonText}>
 Reserve seat
</Text>
</Pressable>

)}



{joined && !isDriver && !rideStarted && !r.completed && (

<Pressable
 style={[components.button,{marginTop:spacing.md}]}
 onPress={cancelSeat}
>
<Text style={components.buttonText}>
 Cancel reservation
</Text>
</Pressable>

)}



{isDriver && !rideStarted && !r.completed && !editingCar && (

<Pressable
 style={[components.button,{marginTop:spacing.md}]}
 onPress={cancelRide}
>
<Text style={components.buttonText}>
 Cancel ride
</Text>
</Pressable>

)}



{canComplete && (

<Pressable
 style={[components.button,{marginTop:spacing.md}]}
 onPress={completeRide}
>
<Text style={components.buttonText}>
 Complete ride
</Text>
</Pressable>

)}



{canRateDriver && (

<Pressable
 style={[components.button,{marginTop:spacing.md}]}
 onPress={() =>

 router.push({

  pathname:"/review/[id]",

  params:{
   id:r.id,
   targetUserId:r.driverId
  }

 })

 }
>

<Text style={components.buttonText}>
 Rate driver
</Text>

</Pressable>

)}


</ScrollView>

</SafeAreaView>

);

}
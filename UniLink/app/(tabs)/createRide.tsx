import { useState, useCallback } from "react";

import {
 View,
 Text,
 TextInput,
 Button,
 Switch,
 StyleSheet
} from "react-native";

import { Picker } from "@react-native-picker/picker";

import DateTimePicker
 from "@react-native-community/datetimepicker";

import {
 addRide
} from "../../data/rides";

import {
 getUserCars
} from "../../data/cars";

import {
 getCurrentUser
} from "../../data/user";

import {
 useFocusEffect,
 useRouter
} from "expo-router";

export default function CreateRide(){

 const router = useRouter();

 const [user,setUser] =
  useState(getCurrentUser());

 const [cars,setCars] =
  useState(getUserCars(user.id));

 const [origin,setOrigin] =
  useState("");

 const [destination,setDestination] =
  useState("");

 const [selectedCar,setSelectedCar] =
  useState<string | undefined>(
   cars[0]?.id
  );

 const [seats,setSeats] =
  useState("");

 const [womenOnly,setWomenOnly] =
  useState(false);

 const [date,setDate] =
  useState(new Date());

 const [time,setTime] =
  useState(new Date());

 const [showDate,setShowDate] =
  useState(false);

 const [showTime,setShowTime] =
  useState(false);


 useFocusEffect(

  useCallback(()=>{

   const current = getCurrentUser();

   const userCars =
    getUserCars(current.id);
    setUser(current);
    setCars(userCars);
   setSelectedCar(
    userCars[0]?.id
   );

   setOrigin("");
   setDestination("");
   setSeats("");
   setWomenOnly(false);

  },[])

 );


 const car =
  cars.find(
   c => c.id === selectedCar
  );


 function createRide(){

  if(
   !origin.trim() ||
   !destination.trim() ||
   !car
  ){
   alert("Fill all fields");
   return;
  }

  if(origin.trim().toLowerCase() ===
   destination.trim().toLowerCase()
  ){
   alert("Origin and destination must differ");
   return;
  }

  const seatsNumber =Number(seats);

  if(!Number.isInteger(seatsNumber)){
   alert("Seats must be integer");
   return;
  }

  if(seatsNumber < 1){
    alert("Must allow at least 1 passenger");
   return;
  }

  if(seatsNumber >car.seatCapacity - 1){
   alert(`Max passengers ${car.seatCapacity-1}`);
   return;
  }

  const departure =
   new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    time.getHours(),
    time.getMinutes()
   );

  if(departure < new Date()){
   alert("Cannot create ride in past");
   return;
  }

  addRide({

   id: Date.now().toString(),
   driverId: user.id,
   carId:car.id,
   origin:origin.trim(),
   destination:destination.trim(),
   departureDateTime:departure.toISOString(),
   availableSeats:seatsNumber,
   totalSeats:seatsNumber,
   womenOnly,
   passengers:[],
   completed:false
  });

  alert("Ride created");

  router.replace("/(tabs)/myRides");

 }

 if(cars.length === 0){
  return(
   <View style={styles.container}>
    <Text style={styles.title}>
     Create Ride
    </Text>
    <Text>
     Add a car first in Profile
    </Text>
   </View>
  );

 }


 return(

  <View style={styles.container}>

   <Text style={styles.title}>
    Create Ride
   </Text>

   <TextInput
    placeholder="Origin"
    value={origin}
    maxLength={40}
    onChangeText={setOrigin}
    style={styles.input}
   />

   <TextInput
    placeholder="Destination"
    value={destination}
    maxLength={40}
    onChangeText={setDestination}
    style={styles.input}
   />


   <Text>Date</Text>

   <Button
    title={
     date.toDateString()
    }
    onPress={()=>
     setShowDate(true)
    }

   />


   {showDate && (
    <DateTimePicker
     value={date}
     mode="date"
     onChange={(e,d)=>{
      setShowDate(false);
      if(d)
       setDate(d);
     }}
    />
   )}


   <Text>Time</Text>
   <Button
    title={
     time.toLocaleTimeString([],{
      hour:"2-digit",
      minute:"2-digit"
     })
    }
    onPress={()=>
     setShowTime(true)
    }
   />


   {showTime && (
    <DateTimePicker
     value={time}
     mode="time"
     onChange={(e,t)=>{
      setShowTime(false);
      if(t)
       setTime(t);
     }}
    />
   )}

   <Text>Car</Text>

   <Picker
    selectedValue={selectedCar}
    onValueChange={
     setSelectedCar
    }
   >
    {cars.map(c=>(
     <Picker.Item
      key={c.id}
      label={`${c.model} (${c.licensePlate})`}
      value={c.id}
     />
    ))}

   </Picker>

   <TextInput
    placeholder={`1-${car.seatCapacity-1} seats`}
    value={seats}
    onChangeText={setSeats}
    keyboardType="numeric"
    style={styles.input}
   />

   <View style={styles.row}>
    <Text>
     Women only
    </Text>
    <Switch
     value={womenOnly}
     onValueChange={
      setWomenOnly
     }
    />

   </View>
   <Button
    title="Create Ride"
    onPress={createRide}
   />
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
  fontSize:20,
  fontWeight:"bold"
 },

 input:{
  borderWidth:1,
  padding:10,
  borderRadius:5
 },

 row:{
  flexDirection:"row",
  justifyContent:"space-between",
  alignItems:"center"
 }

});
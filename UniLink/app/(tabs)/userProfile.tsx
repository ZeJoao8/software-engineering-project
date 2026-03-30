import { useState } from "react";

import {
 View,
 Text,
 TextInput,
 Button,
 StyleSheet,
 Alert,
 ScrollView
} from "react-native";

import {
 getCurrentUser,
 getUsers,
  updateUser,
} from "../../data/user";

import {
 getUserCars,
 addCar,
 deleteCar
} from "../../data/cars";

import { getRides,
 deleteRide
} from "../../data/rides";

import { useRouter }
 from "expo-router";

import { logoutUser } from "../../data/user";

const router = useRouter();

export default function Profile(){

 const [user,setUser] =
  useState(getCurrentUser());

 const [editing,setEditing] =
  useState(false);

 const [showCarForm,setShowCarForm] =
  useState(false);

 const [model,setModel] =
  useState("");

 const [color,setColor] =
  useState("");

 const [plate,setPlate] =
  useState("");

 const [seats,setSeats] =
  useState("");

 const userCars =
  getUserCars(user.email);


 function startEdit(){

  setEditing(true);

 }


 function cancelEdit(){
  setUser(getCurrentUser());
  setEditing(false);
  setShowCarForm(false);
  setModel("");
  setColor("");
  setPlate("");
  setSeats("");
 }


 function saveProfile(){
  updateUser(user);
  setUser({...user});
  setEditing(false);
  Alert.alert("Saved");
 }

function removeCar(carId:string){
 const ridesUsingCar =
  getRides().filter(
   r =>
    r.carId === carId &&
    !r.completed &&
    new Date(r.departureDateTime) > new Date()
  );
 const warningText =
  ridesUsingCar.length > 0
   ? `This will cancel ${ridesUsingCar.length} future ride(s) using this car.`
   : "Are you sure you want to remove this car?";
 Alert.alert(
  "Remove car",
  warningText,
  [
   {
    text:"No",
    style:"cancel"
   },
   {
    text:"Yes",
    style:"destructive",
    onPress:()=>{
     ridesUsingCar.forEach(
      r => deleteRide(r.id)
     );
     deleteCar(carId);
     setUser({...getCurrentUser()});
    }
   }
  ]
 );
}

 function addNewCar(){
  if(
   !model.trim() ||
   !color.trim() ||
   !plate.trim() ||
   !seats.trim()
  ){
   Alert.alert("Fill all fields");
   return;
  }
  if(model.length > 40){
   Alert.alert("Model max 40 chars");
   return;
  }
  const seatsNumber = Number(seats);
  if(
   !Number.isInteger(seatsNumber) ||
   seatsNumber <= 0
  ){
   Alert.alert("Seats must be integer > 0");
   return;
  }
  const formattedPlate =
   plate.toUpperCase().replace(/\s/g,"");
  const plateRegex = /^[A-Z0-9-]{6,8}$/;
  if(!plateRegex.test(formattedPlate)){
   Alert.alert("Invalid plate format");
   return;
  }
  const duplicate =
   getUserCars(user.email)
    .some(
     c =>
      c.licensePlate ===
      formattedPlate
    );
  if(duplicate){
   Alert.alert("Plate already exists");
   return;
  }
  addCar({
   id: Date.now().toString(),
   model: model.trim(),
   color: color.trim(),
   licensePlate: formattedPlate,
   seatCapacity: seatsNumber,
   ownerId: user.email
  });
  setModel("");
  setColor("");
  setPlate("");
  setSeats("");
  setShowCarForm(false);
 }

 return(
  <ScrollView
    style={styles.container}
    contentContainerStyle={styles.content}
  >
   <Text style={styles.title}>
    Profile
   </Text>
   <Text style={styles.section}>
    Info
   </Text>
   <Text>
    Name: {editing ? (
    <TextInput
     value={user.name}
     onChangeText={t=>
      setUser({
       ...user,
       name:t
      })
     }
     style={styles.input}
    />
   ) : (
    <Text>
     {user.name}
    </Text>
   )}
   </Text>

   <Text>
    Gender: {user.gender}
   </Text>


   <Text>
    University: {user.university}
   </Text>

   <Text>
    Course: {editing ? (
    <TextInput
     value={user.course}
     onChangeText={t=>
      setUser({
       ...user,
       course:t
      })
     }
     style={styles.input}
    />
   ) : (
    <Text>
     {user.course}
    </Text>
   )}
   </Text>

   <Text style={styles.section}>
    My Cars
   </Text>
   {userCars.length === 0 && (
    <Text>
     No cars yet
    </Text>
   )}
   {userCars.map(car => (
    <View
     key={car.id}
     style={styles.carRow}
    >
     <Text>
      {car.model}
      {" - "}
      {car.color}
      {" - "}
      {car.licensePlate}
      {" ("}
      {car.seatCapacity}
      {" seats)"}
     </Text>
     {editing && (
      <Text
       style={styles.remove}
       onPress={() =>
        removeCar(car.id)
       }
      >
       remove
      </Text>

     )}
    </View>
   ))}

   {editing && (
    <Button
     title={
      showCarForm
       ? "Cancel add car"
       : "Add car"
     }
     onPress={()=>
      setShowCarForm(
       !showCarForm
      )
     }
    />
   )}

   {editing && showCarForm && (
    <>
    <Text>Model</Text>
     <TextInput
      placeholder="Model"
      value={model}
      onChangeText={setModel}
      style={styles.input}
     />
      <Text>Color</Text>
     <TextInput
      placeholder="Color"
      value={color}
      onChangeText={setColor}
      style={styles.input}
     />
      <Text>License Plate</Text>
     <TextInput
      placeholder="License plate"
      value={plate}
      onChangeText={setPlate}
      autoCapitalize="characters"
      style={styles.input}
     />
      <Text>Number of seats</Text>
     <TextInput
      placeholder="Seats"
      value={seats}
      onChangeText={setSeats}
      keyboardType="numeric"
      style={styles.input}
     />

     <Button
      title="Save car"
      onPress={addNewCar}
     />
    </>
   )}

   {!editing && (
    <Button
     title="Edit profile"
     onPress={startEdit}
    />
   )}

   {editing && (
    <>
     <Button
      title="Save profile"
      onPress={saveProfile}
     />
    
     <Button
      title="Cancel"
      onPress={cancelEdit}
     />
    </>
   )}

<Text style={styles.section}>
 Session
</Text>

<Button
 title="Logout"
onPress={() =>
 Alert.alert(
  "Logout",
  "Are you sure?",
  [
   {
    text:"Cancel",
    style:"cancel"
   },
   {
    text:"Logout",
    onPress:() => {
     logoutUser();
     router.replace("/login");
    }
   }
  ]
 )}
/>
  </ScrollView>
 );
}

const styles = StyleSheet.create({

 container:{
  flex:1,
  backgroundColor:"white"
 },

 content:{
  padding:20,
  gap:12
 },

 title:{
  fontSize:20,
  fontWeight:"bold",
  marginBottom:5
 },

 section:{
  marginTop:20,
  fontWeight:"bold",
  fontSize:16
 },

 input:{
  borderWidth:1,
  padding:12,
  borderRadius:6
 },

 carRow:{
  flexDirection:"row",
  justifyContent:"space-between",
  alignItems:"center",
  paddingVertical:4
 },

 remove:{
  color:"red"
 }

});
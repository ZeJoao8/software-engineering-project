import { useState } from "react";

import {
 View,
 Text,
 TextInput,
 Button,
 StyleSheet
} from "react-native";

import {
 getCurrentUser,
 updateUser,
 getUsers,
 switchUser
} from "../../data/user";

import {
 getUserCars,
 addCar
} from "../../data/cars";

export default function Profile(){

 const [user,setUser]=
  useState(getCurrentUser());

 const [showCarForm,setShowCarForm]=
  useState(false);

 const [model,setModel]=useState("");

 const [color,setColor]=useState("");

 const [plate,setPlate]=useState("");

 const [seats,setSeats]=useState("");

 const userCars=
  getUserCars(user.id);

 function saveProfile(){

  updateUser(user);

  setUser({...user});

  alert("Saved");

 }

 function changeUser(id:string){

  switchUser(id);

  setUser(getCurrentUser());

 }

function addNewCar(){

 if(
  !model.trim() ||
  !color.trim() ||
  !plate.trim() ||
  !seats.trim()
 ){

  alert("Fill all fields");
  return;

 }

 if(model.length > 40){

  alert("Model max 40 chars");
  return;

 }

 const seatsNumber = Number(seats);

 if(!Number.isInteger(seatsNumber) || seatsNumber <= 0){

  alert("Seats must be integer > 0");
  return;

 }

 const formattedPlate =
  plate
   .toUpperCase()
   .replace(/\s/g,"");

 const plateRegex =
 /^[A-Z0-9-]{6,8}$/;

 if(!plateRegex.test(formattedPlate)){

  alert("Invalid plate format");
  return;

 }

 const duplicate =
  getUserCars(user.id)
   .some(

    c =>
     c.licensePlate ===
     formattedPlate

   );

 if(duplicate){

  alert("Plate already exists");
  return;

 }

 addCar({

  id: Date.now().toString(),

  model: model.trim(),

  color: color.trim(),

  licensePlate: formattedPlate,

  seatCapacity: seatsNumber,

  ownerId: user.id

 });

 setModel("");
 setColor("");
 setPlate("");
 setSeats("");

 setShowCarForm(false);

}

 return(

  <View style={styles.container}>

   <Text style={styles.title}>
    Profile
   </Text>
    <Text>Name</Text>
   <TextInput
    value={user.name}
    onChangeText={t=>
     setUser({...user,name:t})
    }
    placeholder="Name"
    style={styles.input}
   />
      <Text>Course</Text>
   <TextInput
    value={user.course}
    onChangeText={t=>
     setUser({...user,course:t})
    }
    placeholder="Course"
    style={styles.input}
   />

   <Text>
    Gender: {user.gender}
   </Text>

   <Text>
    University: {user.university}
   </Text>

   <Button
    title="Save profile"
    onPress={saveProfile}
   />

   <Text style={styles.subtitle}>
    My Cars
   </Text>

   {userCars.map(car=>(

    <Text key={car.id}>

     {car.model}
     {" - "}
     {car.color}
     {" - "}
     {car.licensePlate}
     {" ("}
     {car.seatCapacity}
     {" seats)"}

    </Text>

   ))}

   <Button
    title={
     showCarForm
      ? "Cancel"
      : "Add car"
    }
    onPress={()=>
     setShowCarForm(!showCarForm)
    }
   />

   {showCarForm && (

    <>

     <TextInput
      placeholder="Model"
      value={model}
      onChangeText={setModel}
      style={styles.input}
     />

     <TextInput
      placeholder="Color"
      value={color}
      onChangeText={setColor}
      style={styles.input}
     />

     <TextInput
      placeholder="License plate"
      value={plate}
      onChangeText={setPlate}
      autoCapitalize="characters"
      style={styles.input}
     />

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

   <Text style={styles.subtitle}>
    Switch profile
   </Text>

   {getUsers().map(u=>(

    <Button
     key={u.id}
     title={`${u.name} (${u.gender})`}
     onPress={()=>
      changeUser(u.id)
     }
    />

   ))}

  </View>

 );

}

const styles=StyleSheet.create({

 container:{
  flex:1,
  padding:20,
  gap:10
 },

 title:{
  fontSize:20,
  fontWeight:"bold"
 },

 subtitle:{
  marginTop:20,
  fontWeight:"bold"
 },

 input:{
  borderWidth:1,
  padding:10,
  borderRadius:5
 }

});
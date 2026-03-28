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

  alert("Fill all car fields");

  return;

 }

 const seatsNumber =
  Number(seats);

 if(
  !Number.isInteger(seatsNumber)
 ){

  alert("Seats must be an integer");

  return;

 }

 if(seatsNumber <= 0){

  alert("Seats must be greater than 0");

  return;

 }

 if(seatsNumber > 9){

  alert("Max 9 seats allowed");

  return;

 }

 addCar({

  id: Date.now().toString(),

  model: model.trim(),

  color: color.trim(),

  licensePlate:
   plate.toUpperCase().trim(),

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
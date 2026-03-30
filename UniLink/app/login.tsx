import { useState }
 from "react";

import {

 View,
 Text,
 TextInput,
 Button,
 StyleSheet,
 Alert,
 Switch

} from "react-native";

import {

 loginUser,
 registerUser

} from "../data/user";

import {

 useRouter

} from "expo-router";

import { Picker } from "@react-native-picker/picker";

export default function Login(){

 const router =
  useRouter();

 const [registerMode,
  setRegisterMode] =
   useState(false);

 const [email,setEmail] =
  useState("");

 const [password,setPassword] =
  useState("");

 const [name,setName] =
  useState("");

 const [university,setUniversity] =
  useState("");

 const [course,setCourse] =
  useState("");

 const [gender,setGender] =
  useState<"male"|"female">(
   "male"
  );


 function login(){

  const success =
   loginUser(
    email,
    password
   );

  if(!success){

   Alert.alert(
    "Invalid credentials"
   );

   return;

  }

  router.replace(
   "/(tabs)/searchRide"
  );

 }


 function register(){

  if(
   !name.trim() ||
   !email.trim() ||
   !password.trim() ||
   !university.trim() ||
   !course.trim()
  ){

   Alert.alert(
    "Fill all fields"
   );

   return;

  }


  const user =
   registerUser(

    name,
    email,
    password,
    university,
    course,
    gender

   );


  if(!user){

   Alert.alert(
    "Email already exists"
   );

   return;

  }


  router.replace(
   "/(tabs)/searchRide"
  );

 }


 return(

  <View style={styles.container}>

   <Text style={styles.title}>
    UniLink
   </Text>


   {registerMode && (

    <>

     <TextInput

      placeholder="Name"

      value={name}

      onChangeText={setName}

      style={styles.input}

     />

    </>

   )}


   <TextInput

    placeholder="Email"

    value={email}

    onChangeText={setEmail}

    style={styles.input}

   />


   <TextInput

    placeholder="Password"

    value={password}

    onChangeText={setPassword}

    secureTextEntry

    style={styles.input}

   />


   {registerMode && (

    <>

     <TextInput

      placeholder="University"

      value={university}

      onChangeText={setUniversity}

      style={styles.input}

     />


     <TextInput

      placeholder="Course"

      value={course}

      onChangeText={setCourse}

      style={styles.input}

     />


     <Text>
      Gender
      </Text>

      <Picker
      selectedValue={gender}
      onValueChange={setGender}
      >

      <Picker.Item
        label="Male"
        value="Male"
      />

      <Picker.Item
        label="Female"
        value="Female"
      />

      </Picker>

    </>

   )}


   {registerMode ? (

    <Button
     title="Create account"
     onPress={register}
    />

   ) : (

    <Button
     title="Login"
     onPress={login}
    />

   )}


   <Text

    style={styles.link}

    onPress={()=>

     setRegisterMode(

      !registerMode

     )

    }

   >

    {registerMode
     ? "Already have account?"
     : "Create account"}

   </Text>


   {!registerMode && (

    <Text style={styles.hint}>

     test accounts:

     {"\n"}

     joao@feup.pt / 1234

     {"\n"}

     maria@feup.pt / 1234

    </Text>

   )}


  </View>

 );

}


const styles =
 StyleSheet.create({

 container:{
  flex:1,
  justifyContent:"center",
  padding:20,
  gap:10
 },

 title:{
  fontSize:26,
  fontWeight:"bold",
  textAlign:"center"
 },

 input:{
  borderWidth:1,
  padding:10,
  borderRadius:6
 },

 link:{
  color:"blue",
  textAlign:"center"
 },

 hint:{
  marginTop:20,
  fontSize:12,
  color:"gray",
  textAlign:"center"
 },

 row:{
  flexDirection:"row",
  justifyContent:"space-between",
  alignItems:"center"
 }

});
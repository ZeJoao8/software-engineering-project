import { useState } from "react";

import {
 View,
 Text,
 TextInput,
 ScrollView,
 Alert
} from "react-native";

import {
 loginUser,
 registerUser
} from "../data/user";

import { useRouter } from "expo-router";

import { Picker } from "@react-native-picker/picker";

import { layout } from "../styles/layout";
import { forms } from "../styles/forms";
import { components } from "../styles/components";
import { spacing, colors } from "../styles/theme";


export default function Login(){

 const router = useRouter();

 const [registerMode,setRegisterMode] = useState(false);

 const [email,setEmail] = useState("");

 const [password,setPassword] = useState("");

 const [confirmPassword,setConfirmPassword] = useState("");

 const [name,setName] = useState("");

 const [university,setUniversity] = useState("");

 const [course,setCourse] = useState("");

 const [gender,setGender] =
  useState<"Male"|"Female">("Male");


 function login(){

  const success =
   loginUser(email,password);

  if(!success){

   Alert.alert(
    "Login failed",
    "Invalid email or password"
   );

   return;

  }

  router.replace("/(tabs)/searchRide");

 }


 function register(){

  if(
   !name.trim() ||
   !email.trim() ||
   !password.trim() ||
   !university.trim() ||
   !course.trim() ||
   !confirmPassword.trim()
  ){
   Alert.alert(
    "Error",
    "Fill all fields"
   );
   return;
  }


  const emailRegex =
   /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if(!emailRegex.test(email)){

   Alert.alert(
    "Invalid email",
    "Enter valid email format"
   );

   return;

  }

  if(password !== confirmPassword){

  Alert.alert(
    "Passwords do not match",
    "Please confirm your password correctly"
  );
  return;
  }

  if(password.length < 4){

  Alert.alert(
    "Weak password",
    "Password must have at least 4 characters"
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
   return;
  }

  router.replace("/(tabs)/searchRide");

 }


 return(

<ScrollView
 style={layout.screen}
 contentContainerStyle={{
  justifyContent:"center",
  flexGrow:1
 }}
>


<Text style={[
 layout.title,
 {textAlign:"center"}
]}>
 UniLink 🌱
</Text>



<View style={components.card}>


{registerMode && (

<>

<Text style={forms.label}>
 Name
</Text>

<TextInput
 value={name}
 onChangeText={setName}
 style={forms.input}
/>


<View style={{height:spacing.sm}} />


<Text style={forms.label}>
 University
</Text>

<TextInput
 value={university}
 onChangeText={setUniversity}
 style={forms.input}
/>


<View style={{height:spacing.sm}} />


<Text style={forms.label}>
 Course
</Text>

<TextInput
 value={course}
 onChangeText={setCourse}
 style={forms.input}
/>


<View style={{height:spacing.sm}} />


<Text style={forms.label}>
 Gender
</Text>


<View style={components.pickerWrapper}>

<Picker
 selectedValue={gender}
 onValueChange={setGender}
 dropdownIconColor={colors.primary}
 style={{
  color:colors.primary,
  fontWeight:"600"
 }}
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

</View>


<View style={{height:spacing.sm}} />

</>

)}



<Text style={forms.label}>
 Email
</Text>

<TextInput
 value={email}
 onChangeText={setEmail}
 autoCapitalize="none"
 keyboardType="email-address"
 style={forms.input}
/>


<View style={{height:spacing.sm}} />


<Text style={forms.label}>
 Password
</Text>

<TextInput
 value={password}
 onChangeText={setPassword}
 secureTextEntry
 style={forms.input}
/>


{registerMode && (

<>

<View style={{height:spacing.sm}} />

<Text style={forms.label}>
 Confirm password
</Text>

<TextInput
 value={confirmPassword}
 onChangeText={setConfirmPassword}
 secureTextEntry
 style={forms.input}
/>

</>

)}




<View style={{height:spacing.md}} />


<View style={components.button}>

<Text
 style={components.buttonText}
 onPress={
  registerMode
   ? register
   : login
 }
>

{registerMode
 ? "CREATE ACCOUNT"
 : "LOGIN"}

</Text>

</View>



<View style={{height:spacing.sm}} />


<View style={components.outlineButton}>

<Text
 style={components.outlineButtonText}
 onPress={()=>
  setRegisterMode(!registerMode)
 }
>

{registerMode
 ? "Already have account?"
 : "Create account"}

</Text>

</View>



{!registerMode && (

<Text
 style={{
  marginTop:spacing.md,
  fontSize:12,
  color:colors.textLight,
  textAlign:"center"
 }}
>

test accounts:

{"\n"}

joao@feup.pt / 1234

{"\n"}

maria@feup.pt / 1234

</Text>

)}


</View>


</ScrollView>

 );

}
import { useState } from "react";

import {
<<<<<<< HEAD
 View,
 Text,
 TextInput,
 ScrollView,
 Alert
=======
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert
>>>>>>> test/auth-and-ride
} from "react-native";

import {
  loginUser,
  registerUser
} from "../data/user";

<<<<<<< HEAD
import { useRouter } from "expo-router";

import { Picker } from "@react-native-picker/picker";

import { layout } from "../styles/layout";
import { forms } from "../styles/forms";
import { components } from "../styles/components";
import { spacing, colors } from "../styles/theme";


export default function Login(){
=======
import {
  useRouter
} from "expo-router";

import { Picker } from "@react-native-picker/picker";

export default function Login() {
>>>>>>> test/auth-and-ride

  const router = useRouter();

  const [registerMode, setRegisterMode] = useState(false);

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

<<<<<<< HEAD
 const [confirmPassword,setConfirmPassword] = useState("");

 const [name,setName] = useState("");
=======
  const [name, setName] = useState("");
>>>>>>> test/auth-and-ride

  const [university, setUniversity] = useState("");

  const [course, setCourse] = useState("");

  const [gender, setGender] =
    useState<"Male" | "Female">("Male");


  function login() {

    const success =
      loginUser(email, password);

    if (!success) {

      Alert.alert(
        "Login failed",
        "Invalid email or password"
      );

      return;

    }

    router.replace("/(tabs)/searchRide");

  }


<<<<<<< HEAD
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
=======
  function register() {
    if (
      !name.trim() ||
      !email.trim() ||
      !password.trim() ||
      !university.trim() ||
      !course.trim()
    ) {
      Alert.alert(
        "Error",
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
    if (!user) return;
    router.replace("/(tabs)/searchRide");
  }


  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        UniLink
      </Text>
      {registerMode && (
        <TextInput
          placeholder="Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
      )}

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
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
     <Text>Gender</Text>
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
    onPress={()=>setRegisterMode(!registerMode)}
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
>>>>>>> test/auth-and-ride
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

<<<<<<< HEAD
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
=======
  });
>>>>>>> test/auth-and-ride

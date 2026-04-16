import { useEffect, useState } from "react";

import {
 View,
 Text,
 TextInput,
 ScrollView,
 Alert,
 Pressable,
 ActivityIndicator
} from "react-native";

import {
 getCurrentUser,
 isAuthReady,
 loginUser,
 registerUser,
 subscribeToAuthChanges,
 waitForAuthReady,
} from "../data/user";

import { useRouter } from "expo-router";

import DropDownPicker from "react-native-dropdown-picker";

import { layout } from "../styles/layout";
import { forms } from "../styles/forms";
import { components } from "../styles/components";
import { spacing, colors } from "../styles/theme";
import {
  areRequiredFieldsFilled,
  doPasswordsMatch,
  isPasswordStrong,
  isValidEmail,
} from "../utils/validation";


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

 const [loading, setLoading] =
  useState(false);

 const [ready, setReady] =
  useState(isAuthReady());

  const [genderDropdownOpen, setGenderDropdownOpen] =
 useState(false);

  const genderItems = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" }
  ];

 useEffect(() => {
  let mounted = true;

  function syncState() {
   if (!mounted) return;
   setReady(isAuthReady());

   if (getCurrentUser()) {
    router.replace("/(tabs)/searchRide");
   }
  }

  syncState();

  const unsubscribe =
   subscribeToAuthChanges(syncState);

  void waitForAuthReady().then(syncState);

  return () => {
   mounted = false;
   unsubscribe();
  };
 }, [router]);


 async function login(){

  if(loading) return;

  setLoading(true);

  const success =
   await loginUser(email,password);

  if(!success){
   setLoading(false);

   return;

  }

  setLoading(false);
  router.replace("/(tabs)/searchRide");

 }


 async function register(){

  if(loading) return;

  const fields = {
    name,
    email,
    password,
    university,
    course,
    confirmPassword
  };

  if(!areRequiredFieldsFilled(fields)){
   Alert.alert(
    "Error",
    "Fill all fields"
   );
   return;
  }


  if(!isValidEmail(email)){

   Alert.alert(
    "Invalid email",
    "Enter valid email format"
   );

   return;

  }

  if(!doPasswordsMatch(password, confirmPassword)){

  Alert.alert(
    "Passwords do not match",
    "Please confirm your password correctly"
  );
  return;
  }

  if(!isPasswordStrong(password)){

  Alert.alert(
    "Weak password",
    "Password must have at least 4 characters"
  );

  return;

  }

  setLoading(true);

  const user =
   await registerUser(
    name,
    email,
    password,
    university,
    course,
    gender
   );

  if(!user){
   setLoading(false);
   return;
  }

  setLoading(false);
  router.replace("/(tabs)/searchRide");

 }

 if(!ready){
  return(
   <View
    style={{
     flex:1,
     justifyContent:"center",
     alignItems:"center"
    }}
   >
    <ActivityIndicator color={colors.primary} />
   </View>
  );
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
 ]}
 testID="authScreenTitle"
 >
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
 testID="registerNameInput"
/>


<View style={{height:spacing.sm}} />


<Text style={forms.label}>
 University
</Text>

<TextInput
 value={university}
 onChangeText={setUniversity}
 style={forms.input}
 testID="registerUniversityInput"
/>


<View style={{height:spacing.sm}} />


<Text style={forms.label}>
 Course
</Text>

<TextInput
 value={course}
 onChangeText={setCourse}
 style={forms.input}
 testID="registerCourseInput"
/>


<View style={{height:spacing.sm}} />


<Text style={forms.label}>
 Gender
</Text>


<View style={components.pickerWrapper}>

  <DropDownPicker
  open={genderDropdownOpen}
  value={gender}
  items={genderItems}

  setOpen={setGenderDropdownOpen}
  setValue={setGender}

  placeholder="Select gender"
  testID="genderPicker"

  style={components.dropdown}

  dropDownContainerStyle={
    components.dropdownContainer
  }

  textStyle={components.dropdownText}

  placeholderStyle={
    components.dropdownPlaceholder
  }

  listMode="SCROLLVIEW"

  scrollViewProps={{
    nestedScrollEnabled: true
  }}
  />

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
 testID="loginEmailInput"
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
 testID="loginPasswordInput"
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
 testID="registerConfirmPasswordInput"
/>

</>

)}




<View style={{height:spacing.md}} />


<Pressable style={components.button} testID="authSubmitButton"
 onPress={
  registerMode
   ? register
   : login
 }
 >

<Text
 style={components.buttonText}
>

{loading
 ? "LOADING..."
 : registerMode
   ? "CREATE ACCOUNT"
   : "LOGIN"}

</Text>

</Pressable>



<View style={{height:spacing.sm}} />


<Pressable
 style={components.outlineButton}
 testID="authModeToggleButton"
 onPress={()=>
  setRegisterMode(!registerMode)
 }
>
<Text
 style={components.outlineButtonText}
>
{registerMode
 ? "Already have account?"
 : "Create account"}
</Text>
</Pressable>


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

joao@feup.pt / 123456

{"\n"}

maria@feup.pt / 123456

{"\n"}

ana@feup.pt / 123456

</Text>

)}

</View>


</ScrollView>

 );

}

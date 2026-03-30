import {
 View,
 Text,
 StyleSheet
} from "react-native";

import { SafeAreaView }
 from "react-native-safe-area-context";

import {
 useLocalSearchParams,
 useRouter
} from "expo-router";

import {
 getUsers
} from "../../data/user";

import {
 getUserCars
} from "../../data/cars";


export default function PublicProfile(){

 const router = useRouter();

 const params =
  useLocalSearchParams();

 const id =
  typeof params.id === "string"
   ? params.id
   : undefined;

 const user =
  id
   ? getUsers().find(
      u => u.id === id
     )
   : undefined;

 if(!user) return null;

 const cars =
  getUserCars(user.id);


 return(

  <SafeAreaView style={styles.container}>

   <Text
    style={styles.back}
    onPress={()=> router.back()}
   >
    ← Back
   </Text>


   <Text style={styles.title}>
    {user.name}
   </Text>


   <Text style={styles.section}>
    Info
   </Text>


   <Text>
    Gender: {user.gender}
   </Text>

   <Text>
    University: {user.university}
   </Text>

   <Text>
    Course: {user.course}
   </Text>


   <Text style={styles.section}>
    Cars
   </Text>


   {cars.length === 0 && (
    <Text>
     No cars
    </Text>
   )}


   {cars.map(c => (

    <Text key={c.id}>

     {c.model}
     {" - "}
     {c.color}
     {" - "}
     {c.licensePlate}

    </Text>

   ))}

  </SafeAreaView>

 );

}


const styles =
 StyleSheet.create({

 container:{
  flex:1,
  padding:20,
  gap:10
 },

 title:{
  fontSize:22,
  fontWeight:"bold"
 },

 section:{
  marginTop:15,
  fontWeight:"bold"
 },

 back:{
  fontSize:16,
  marginBottom:10,
  color:"blue"
 }

});
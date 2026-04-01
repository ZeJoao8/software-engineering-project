import {
 View,
 Text
} from "react-native";

import { SafeAreaView }
 from "react-native-safe-area-context";

import {
 useLocalSearchParams,
 useRouter
} from "expo-router";

import {
 getUserById
} from "../../data/user";

import {
 getUserCars
} from "../../data/cars";

import { components } from "../../styles/components";
import { forms } from "../../styles/forms";
import { layout } from "../../styles/layout";
import { colors, spacing } from "../../styles/theme";

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
   ? getUserById(id)
   : undefined;

 if(!user) return null;

 const cars =
  getUserCars(user.uid, user.email);


return(

<SafeAreaView style={layout.screen}>


<Text
 style={{
  color:colors.primary,
  marginBottom:spacing.sm,
  fontWeight:"600"
 }}

 onPress={()=> router.back()}
>
 ← Back
</Text>



<Text style={layout.title}>
 {user.name}
</Text>



{/* INFO */}
<View style={components.card}>

<Text style={layout.subtitle}>
 Info
</Text>


<Text style={forms.label}>
 Gender
</Text>

<Text>
 {user.gender}
</Text>


<View style={{height:spacing.sm}} />


<Text style={forms.label}>
 University
</Text>

<Text>
 {user.university}
</Text>


<View style={{height:spacing.sm}} />


<Text style={forms.label}>
 Course
</Text>

<Text>
 {user.course}
</Text>

</View>



{/* CARS */}
<View style={components.card}>

<Text style={layout.subtitle}>
 Cars
</Text>


{cars.length === 0 ? (

<Text style={{color:colors.textLight}}>
 No cars
</Text>

) : (

cars.map(c => (

<View
 key={c.id}

 style={{
  marginBottom:spacing.sm
 }}
>

<Text style={{fontWeight:"500"}}>
 {c.model}
</Text>


<Text style={{color:colors.textLight}}>
 {c.color}
</Text>


<Text style={{
  fontWeight:"600"
 }}>
 {c.licensePlate}
</Text>


</View>

))

)}

</View>



</SafeAreaView>

);}

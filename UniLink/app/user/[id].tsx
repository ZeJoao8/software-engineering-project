import { useEffect, useState } from "react";

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

import {
 getRides,
 subscribeToRidesChanges
} from "../../data/rides";

import {
 getAverageRatingForUser,
 getReviewsForUser,
 subscribeToReviewsChanges
} from "../../data/reviews";

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
  
  const [, setVersion] =
   useState(0);

  useEffect(() => {
    const rerender = () => {
     setVersion(value => value + 1);
    };

    const unsubscribeReviews =
    subscribeToReviewsChanges(rerender);

    const unsubscribeRides =
    subscribeToRidesChanges(rerender);

    return () => {
     unsubscribeReviews();
     unsubscribeRides();
    };
  }, []);

 if(!user) return null;

 const cars =
  getUserCars(user.uid, user.email);

 const hasDrivenRide =
  getRides().some(
   ride =>
    ride.driverId === user.uid ||
    ride.driverId === user.email
  );

 const userReviews =
  getReviewsForUser(
   user.uid,
   user.email
  );

 const averageRating =
  getAverageRatingForUser(
   user.uid,
   user.email
  );

 const showRating =
  hasDrivenRide &&
  userReviews.length > 0;

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

{showRating && (
 <Text
  style={{
   marginBottom: spacing.md,
   color: colors.textLight,
   fontSize: 16
  }}
 >
  ⭐ {averageRating} ({userReviews.length} {userReviews.length === 1 ? "rating" : "ratings"})
 </Text>
)}

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

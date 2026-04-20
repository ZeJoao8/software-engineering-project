import {
 ScrollView,
 View,
 Text,
 FlatList
} from "react-native";

import {
 useRouter,
 useFocusEffect
} from "expo-router";

import {
 useState,
 useCallback,
 useEffect
} from "react";

import {
 getRides,
 removeEmptyPastRides,
 subscribeToRidesChanges
} from "../../data/rides";

import { subscribeToReviewsChanges } from "../../data/reviews";
import { subscribeToReportsChanges } from "../../data/reports";

import {
 getCurrentUser
} from "../../data/user";

import { sortByDateDesc } from "../../utils/date";  

import RideCard from "../../components/rideCard";
import { components } from "../../styles/components";
import { layout } from "../../styles/layout";
import { spacing, colors } from "../../styles/theme";

export default function MyRides(){

 const router = useRouter();

 const [rides,setRides] =
  useState(getRides());

 const [user,setUser] =
  useState(getCurrentUser());

  useFocusEffect(
  useCallback(()=>{
    removeEmptyPastRides();
    setRides([...getRides()]);
    setUser(getCurrentUser());
  },[])
  );

useEffect(()=>{
 const triggerRender = () => {
  setRides([...getRides()]);
 };

 const unsubRides = subscribeToRidesChanges(triggerRender);
 const unsubReviews = subscribeToReviewsChanges(triggerRender);
 const unsubReports = subscribeToReportsChanges(triggerRender);

 const interval =
  setInterval(()=>{
   removeEmptyPastRides();
   triggerRender();
  },10000);

 return () => {
  unsubRides();
  unsubReviews();
  unsubReports();
  clearInterval(interval);
 };
},[]);

 if(!user) return null;

  const driverRides = sortByDateDesc(
    rides.filter(r => r.driverId === user.uid)
  );

  const passengerRides = sortByDateDesc(
    rides.filter(r => r.passengers.includes(user.uid))
  );

return(

<ScrollView
      style={layout.scrollScreen}
      contentContainerStyle={{
        flexGrow: 1,
        padding: spacing.lg,
        paddingBottom: spacing.xl
      }}
      keyboardShouldPersistTaps="handled"
    >

<Text style={layout.title}>
 My rides
</Text>


{/* DRIVER */}
<View style={[components.card, { backgroundColor: colors.primarySoft, borderColor: colors.primaryLight, borderWidth: 1.5 }]}>

<Text style={layout.subtitle}>
 Driver
</Text>

{driverRides.length === 0 ? (

<Text style={{color:colors.textLight}}>
 No rides created
</Text>

) : (

<FlatList

 data={driverRides}

 keyExtractor={i=>i.id}

 scrollEnabled={false}

 renderItem={({item}) => (

<View style={{marginTop:spacing.sm}}>

<RideCard

 ride={item}

 showOccupancyLabel

 onPress={() =>
  router.push(`/ride/${item.id}`)
 }

/>

</View>

 )}

 />

)}

</View>



{/* PASSENGER */}
<View style={[components.card, { backgroundColor: colors.neutral, borderColor: colors.neutralLight, borderWidth: 1.5 }]}>

<Text style={layout.subtitle}>
 Passenger
</Text>

{passengerRides.length === 0 ? (

<Text style={{color:colors.textLight}}>
 No reservations
</Text>

) : (

<FlatList

 data={passengerRides}

 keyExtractor={i=>i.id}

 scrollEnabled={false}

 renderItem={({item}) => (

<View style={{marginBottom:spacing.sm}}>

<RideCard

 ride={item}

 onPress={() =>
  router.push(`/ride/${item.id}`)
 }

/>

</View>

 )}

 />

)}

</View>


</ScrollView>

);
}

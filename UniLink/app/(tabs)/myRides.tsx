import {
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
 const unsubscribe =
  subscribeToRidesChanges(()=>{
   setRides([...getRides()]);
  });

 const interval =
  setInterval(()=>{
   removeEmptyPastRides();
   setRides([...getRides()]);
  },10000);

 return () => {
  unsubscribe();
  clearInterval(interval);
 };
},[]);

 if(!user) return null;

 const driverRides = sortByDateDesc(
   rides.filter(
   r =>
    r.driverId === user.uid ||
    r.driverId === user.email
  ));

 const passengerRides = sortByDateDesc(
   rides.filter(
   r =>
    r.passengers.includes(user.uid) ||
    r.passengers.includes(user.email)
  ));

return(

<View style={layout.screen}>

<Text style={layout.title}>
 My rides
</Text>


{/* DRIVER */}
<View style={components.card}>

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
<View style={components.card}>

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


</View>

);
}

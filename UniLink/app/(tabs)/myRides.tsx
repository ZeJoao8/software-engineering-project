import {
 View,
 Text,
 FlatList,
 StyleSheet
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
 getRides
} from "../../data/rides";

import {
 getCurrentUser
} from "../../data/user";

import { sortByDateDesc } from "../../utils/date";  

import RideCard from "../../components/rideCard";
import { removeEmptyPastRides } from "../../data/rides";
import { getUserCars } from "../../data/cars";

export default function MyRides(){

 const router = useRouter();

 const [rides,setRides] =
  useState(getRides());

 const [user,setUser] =
  useState(getCurrentUser());

  
  const [now,setNow] =
  useState(new Date());

  useFocusEffect(
  useCallback(()=>{
    removeEmptyPastRides();
    setRides([...getRides()]);
    setUser(getCurrentUser());
  },[])
  );

useEffect(()=>{
 const interval =
  setInterval(()=>{
   removeEmptyPastRides();
   setNow(new Date());
   setRides([...getRides()]);
  },10000);
 return () =>
  clearInterval(interval);
},[]);

 const driverRides = sortByDateDesc(
   rides.filter(
   r => r.driverId === user.id
  ));

 const passengerRides = sortByDateDesc(
   rides.filter(
   r => r.passengers.includes(user.id)
  ));

 function renderRide(item:any){
  return(
   <RideCard
    ride={item}
    showOccupancyLabel
    onPress={()=>
     router.push(
      `/ride/${item.id}`
     )
    }
   />
  );
 }


 return(
  <View style={styles.container}>
   <Text style={styles.title}>
    Driver
   </Text>
   {driverRides.length === 0 && (
    <Text>
     No rides created
    </Text>
   )}

   <FlatList
    data={driverRides}
    keyExtractor={i=>i.id}
    renderItem={({item})=>
     renderRide(item)
    }
   />

   <Text style={styles.title}>
    Passenger
   </Text>
   {passengerRides.length === 0 && (
    <Text>
     No reservations
    </Text>
   )}

   <FlatList
    data={passengerRides}
    keyExtractor={i=>i.id}
    renderItem={({item})=>
     renderRide(item)
    }
   />
  </View>
 );
}


const styles = StyleSheet.create({

 container:{
  flex:1,
  padding:20,
  gap:10
 },

 title:{
  fontSize:20,
  fontWeight:"bold",
  marginTop:10
 }

});
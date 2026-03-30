import {
 View,
 Text,
 FlatList,
 TextInput,
 Switch,
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
 getRides,
 removeEmptyPastRides
} from "../../data/rides";

import {
 getCurrentUser
} from "../../data/user";

import RideCard from "../../components/rideCard";

import { formatDate, sortByDateAsc } from "../../utils/date";


export default function Home(){

 const router = useRouter();

 const [rides,setRides] =
  useState(getRides());

 const [user,setUser] =
  useState(getCurrentUser());

 const [originFilter,setOriginFilter] =
  useState("");

 const [destinationFilter,setDestinationFilter] =
  useState("");

 const [dateFilter,setDateFilter] =
  useState("");

 const [womenOnlyFilter,setWomenOnlyFilter] =
  useState(false);

 const [minSeats,setMinSeats] =
  useState("");

const [now,setNow] =
 useState(new Date());

 useFocusEffect(
  useCallback(()=>{
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

 const availableRides = sortByDateAsc(rides.filter(r =>
   new Date(r.departureDateTime) >= now &&
   r.availableSeats > 0 &&
   r.driverId !== user.email &&
   !r.passengers.includes(user.email) &&
   r.origin.toLowerCase()
    .includes(originFilter.toLowerCase()
    ) &&
   r.destination.toLowerCase().includes(
     destinationFilter.toLowerCase()
    ) &&
   formatDate(r.departureDateTime)
    .toLowerCase()
    .includes(dateFilter.toLowerCase()
   ) &&
   (
    user?.gender === "Female" ||
    !r.womenOnly
   ) &&
   (
    !minSeats ||
    r.availableSeats >=
    Number(minSeats)
   ) && 
   (
    !womenOnlyFilter ||
    r.womenOnly
   )
  ));


 return(

  <View style={styles.container}>
   <Text style={styles.title}>
    Search Rides
   </Text>

   <TextInput
    placeholder="Origin"
    value={originFilter}
    maxLength={40}
    onChangeText={
     setOriginFilter
    }
    style={styles.input}
   />

   <TextInput
    placeholder="Destination"
    value={destinationFilter}
    maxLength={40}
    onChangeText={
     setDestinationFilter
    }
    style={styles.input}
   />

   <TextInput
    placeholder="Date (ex: 28/03 or 28/03 14:30)"
    value={dateFilter}
    onChangeText={
     setDateFilter
    }
    style={styles.input}
   />

   <TextInput
    placeholder="Min seats"
    value={minSeats}
    keyboardType="numeric"
    onChangeText={
     setMinSeats
    }
    style={styles.input}
   />

   {user?.gender === "Female" &&(
    <View style={styles.row}>
    <Text>
     Women only
    </Text>
    <Switch
     value={womenOnlyFilter}
     onValueChange={
      setWomenOnlyFilter
     }
    />
   </View>
   )}

   {availableRides.length === 0 && (
    <Text>
     No rides found
    </Text>
   )}

   <FlatList
    data={availableRides}
    keyExtractor={i=>i.id}
    renderItem={({item})=>(
     <RideCard
      ride={item}
      onPress={()=>
       router.push(
        `/ride/${item.id}`
       )
      }
     />
    )}
   />

  </View>
 );
}


const styles = StyleSheet.create({

 container:{
  flex:1,
  padding:20
 },

 title:{
  fontSize:22,
  fontWeight:"bold",
  marginBottom:10
 },

 input:{
  borderWidth:1,
  padding:8,
  borderRadius:5,
  marginBottom:10
 },

 row:{
  flexDirection:"row",
  justifyContent:"space-between",
  alignItems:"center",
  marginBottom:10
 }

});
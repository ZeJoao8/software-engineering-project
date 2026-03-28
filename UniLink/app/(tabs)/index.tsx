import {
 View,
 Text,
 FlatList,
 Pressable,
 TextInput,
 StyleSheet
} from "react-native";

import {
 useRouter,
 useFocusEffect
} from "expo-router";

import {
 useState,
 useCallback
} from "react";

import { getRides } from "../../data/rides";
import { getCurrentUser } from "../../data/user";

export default function Home() {

 const router = useRouter();

 const [rides, setRides] =
  useState(getRides());

 const [user, setUser] =
  useState(getCurrentUser());

 const [originFilter, setOriginFilter] =
  useState("");

 const [destinationFilter, setDestinationFilter] =
  useState("");

 const [dateFilter, setDateFilter] =
  useState("");

 useFocusEffect(
  useCallback(() => {

   setRides([...getRides()]);
   setUser(getCurrentUser());

  }, [])
 );

 function formatDate(iso:string) {

  const d = new Date(iso);

  return (
   d.toLocaleDateString()
   + " "
   + d.toLocaleTimeString([],{
    hour:"2-digit",
    minute:"2-digit"
   })
  );

 }

 const availableRides =
  rides.filter(r =>

   r.availableSeats > 0 &&

   r.driverId !== user.id &&

   !r.passengers.includes(user.id) &&

   r.origin
    .toLowerCase()
    .includes(originFilter.toLowerCase()) &&

   r.destination
    .toLowerCase()
    .includes(destinationFilter.toLowerCase()) &&

   formatDate(r.departureDateTime)
    .toLowerCase()
    .includes(dateFilter.toLowerCase())

  );

 return (

  <View style={styles.container}>

   <Text style={styles.title}>
    Search Rides
   </Text>

   <TextInput
    placeholder="Origin"
    value={originFilter}
    onChangeText={setOriginFilter}
    style={styles.input}
   />

   <TextInput
    placeholder="Destination"
    value={destinationFilter}
    onChangeText={setDestinationFilter}
    style={styles.input}
   />

   <TextInput
    placeholder="Date (ex: 28/03 or 28/03 14:30)"
    value={dateFilter}
    onChangeText={setDateFilter}
    style={styles.input}
   />

   {availableRides.length === 0 && (
    <Text>No rides found</Text>
   )}

   <FlatList

    data={availableRides}

    keyExtractor={i => i.id}

    renderItem={({ item }) => (

     <Pressable

      style={styles.card}

      onPress={() =>
       router.push(`/ride/${item.id}`)
      }

     >

      <Text style={styles.route}>
       {item.origin} → {item.destination}
      </Text>

      <Text>
       {formatDate(item.departureDateTime)}
      </Text>

      <Text>
       Seats: {item.availableSeats}
      </Text>

      {item.womenOnly && (
       <Text style={styles.tag}>
        Women only
       </Text>
      )}

     </Pressable>

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

 card:{
  borderWidth:1,
  padding:15,
  marginBottom:10,
  borderRadius:8
 },

 route:{
  fontWeight:"bold",
  fontSize:16
 },

 tag:{
  marginTop:5,
  color:"purple"
 }

});
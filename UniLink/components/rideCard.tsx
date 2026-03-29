import {
 Pressable,
 Text,
 StyleSheet,
 View
} from "react-native";
import { formatDate } from "../utils/date";
export default function RideCard({

 ride,
 onPress,
 showOccupancyLabel = false

}:{

 ride:any,
 onPress:()=>void,
 showOccupancyLabel?:boolean

}){

 return(
  <Pressable
   style={styles.card}
   onPress={onPress}
  >
   <Text style={styles.route}>
    {ride.origin} → {ride.destination}
   </Text>

   <Text>
    {formatDate(
     ride.departureDateTime
    )}
   </Text>

   <Text>
    {showOccupancyLabel && "Occupancy: "}
    {ride.totalSeats - ride.availableSeats}
    {" / "}
    {ride.totalSeats}
    {!showOccupancyLabel && " seats"}
   </Text>

   {ride.womenOnly && (
    <Text style={styles.womenOnly}>
     Women only
    </Text>
   )}

   {ride.completed && (
    <Text style={styles.completed}>
     Completed
    </Text>
   )}
  </Pressable>
 );
}


const styles = StyleSheet.create({

 card:{

  borderWidth:1,
  padding:12,
  borderRadius:8,
  marginVertical:5

 },

 route:{

  fontWeight:"bold"

 },

 womenOnly:{

  marginTop:5,
  color:"purple"

 },

 completed:{

  color:"green"

 }

});
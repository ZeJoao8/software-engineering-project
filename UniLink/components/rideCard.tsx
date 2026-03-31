import {
 Pressable,
 Text,
 View
} from "react-native";

import { formatDate } from "../utils/date";

import { components } from "../styles/components";
import { layout } from "../styles/layout";
import { colors, spacing } from "../styles/theme";


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
 style={components.card}
 onPress={onPress}
>


{/* ROUTE */}
<Text style={{
 fontSize:16,
 fontWeight:"700",
 marginBottom:4
}}>
 {ride.origin} → {ride.destination}
</Text>



{/* DATE */}
<Text style={{
 marginBottom:spacing.sm
}}>
 {formatDate(
  ride.departureDateTime
 )}
</Text>



{/* INFO ROW */}
<View style={{
 flexDirection:"row",
 justifyContent:"space-between",
 alignItems:"center"
}}>


{/* OCCUPANCY */}
<Text style={{
 fontWeight:"500",
 color:colors.textLight
}}>

 {showOccupancyLabel && "Occupancy: "}

 {ride.totalSeats - ride.availableSeats}
 {" / "}
 {ride.totalSeats}

 {!showOccupancyLabel && " seats"}

</Text>



{/* TAGS */}
<View style={{
 flexDirection:"row",
 gap:6
}}>


{ride.womenOnly && (

<Text style={{
 backgroundColor:"#fce7f3",
 color:colors.women,
 paddingHorizontal:8,
 paddingVertical:3,
 borderRadius:6,
 fontSize:12,
 fontWeight:"600"
}}>
 women only
</Text>

)}


{ride.completed && (

<Text style={{
 backgroundColor:"#dcfce7",
 color:colors.primaryDark,
 paddingHorizontal:8,
 paddingVertical:3,
 borderRadius:6,
 fontSize:12,
 fontWeight:"600"
}}>
 completed
</Text>

)}

</View>


</View>


</Pressable>

 );

}
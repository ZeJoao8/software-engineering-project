import { useState } from "react";
import {
 View, Text, TextInput, Button, Switch, StyleSheet
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { addRide } from "../../data/rides";
import { getUserCars } from "../../data/cars";
import { getCurrentUser } from "../../data/user";

export default function CreateRide(){
 const user = getCurrentUser();
 const cars = getUserCars(user.id);
 const [origin, setOrigin] = useState("");
 const [destination, setDestination] = useState("");
 const [selectedCar, setSelectedCar] = useState(cars[0]?.id);
 const [seats, setSeats] = useState("1");
 const [womenOnly, setWomenOnly] = useState(false);

 const tomorrow = new Date();
 tomorrow.setDate(tomorrow.getDate() + 1);
 const [date, setDate] = useState(tomorrow);

 const defaultTime = new Date();
 defaultTime.setHours(12, 0, 0, 0);
 const [time, setTime] = useState(defaultTime);

 const [showDate, setShowDate] = useState(false);
 const [showTime, setShowTime] = useState(false);

 const car = cars.find(c => c.id === selectedCar);

 function createRide(){
  if(!origin.trim() || !destination.trim() || !car){
   alert("Fill all fields");
   return;
  }
  const seatsNumber = Number(seats);
  if(!Number.isInteger(seatsNumber)){
   alert("Seats must be an integer");
   return;
  }
  if(seatsNumber < 1){
   alert("Must have at least 1 passenger seat");
   return;
  }
  if(seatsNumber > car.seatCapacity - 1){
   alert(`Max passengers: ${car.seatCapacity - 1}`);
   return;
  }
  const departure = new Date(
   date.getFullYear(), date.getMonth(), date.getDate(),
   time.getHours(), time.getMinutes()
  );
  if(departure < new Date()){
   alert("Cannot create ride in the past");
   return;
  }
  addRide({
   id: Date.now().toString(),
   driverId: user.id,
   carId: car.id,
   origin: origin.trim(),
   destination: destination.trim(),
   departureDateTime: departure.toISOString(),
   availableSeats: seatsNumber,
   womenOnly,
   passengers: []
  });
  alert("Ride created");
  setOrigin("");
  setDestination("");
  setSeats("1");
 }

 return(
  <View style={styles.container}>
   <Text style={styles.title}>Create Ride</Text>

   <TextInput
    placeholder="Origin"
    value={origin}
    onChangeText={setOrigin}
    style={styles.input}
    returnKeyType="next"
    blurOnSubmit={true}
   />

   <TextInput
    placeholder="Destination"
    value={destination}
    onChangeText={setDestination}
    style={styles.input}
    returnKeyType="done"
    blurOnSubmit={true}
   />

   <Text>Date</Text>
   <Button title={date.toDateString()} onPress={()=>setShowDate(true)} />
   {showDate&&(
    <DateTimePicker value={date} mode="date"
     onChange={(e,d)=>{ setShowDate(false); if(d)setDate(d); }}
    />
   )}

   <Text>Time</Text>
   <Button
    title={time.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
    onPress={()=>setShowTime(true)}
   />
   {showTime&&(
    <DateTimePicker value={time} mode="time"
     onChange={(e,t)=>{ setShowTime(false); if(t)setTime(t); }}
    />
   )}

   <Text>Car</Text>
   <Picker selectedValue={selectedCar} onValueChange={setSelectedCar}>
    {cars.map(c=>(
     <Picker.Item key={c.id}
      label={`${c.model} - ${c.color} (${c.licensePlate})`}
      value={c.id}
     />
    ))}
   </Picker>

   <TextInput
    placeholder={`1-${car?car.seatCapacity-1:0} seats`}
    value={seats}
    onChangeText={setSeats}
    keyboardType="numeric"
    style={styles.input}
   />

   <View style={styles.row}>
    <Text>Women only</Text>
    <Switch value={womenOnly} onValueChange={setWomenOnly} />
   </View>

   <Button
 title="Create Ride"
 onPress={createRide}
 testID="create-ride-button"
/>
  </View>
 );
}

const styles = StyleSheet.create({
 container:{ flex:1, padding:20, gap:10 },
 title:{ fontSize:20, fontWeight:"bold" },
 input:{ borderWidth:1, padding:10, borderRadius:5 },
 row:{ flexDirection:"row", justifyContent:"space-between", alignItems:"center" }
});
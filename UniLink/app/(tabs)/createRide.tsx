import { useState } from "react";

import {

 View,
 Text,
 TextInput,
 Button,
 Switch,
 StyleSheet

} from "react-native";

import { addRide } from "../../data/rides";
import { cars } from "../../data/cars";
import { currentUser } from "../../data/user";

export default function CreateRide() {

 const [origin, setOrigin] = useState("");

 const [destination, setDestination] = useState("");

 const [selectedCarId, setSelectedCarId] = useState(cars[0]?.id);

 const [seats, setSeats] = useState("1");

 const [womenOnly, setWomenOnly] = useState(false);

 const car = cars.find(c => c.id === selectedCarId);

function handleCreateRide() {

 if (!origin || !destination || !car) {

  alert("Fill all fields");
  return;

 }

 const seatsNumber = parseInt(seats);

 if (isNaN(seatsNumber)) {

  alert("Seats must be a number");
  return;

 }

 if (seatsNumber <= 0) {

  alert("Seats must be at least 1");
  return;

 }

 if (seatsNumber > car.seatCapacity-1) {

  alert(
   `Max number of passengers for this car is ${car.seatCapacity-1}`
  );

  return;

 }

 addRide({

  id: Date.now().toString(),

  driverId: currentUser.id,

  carId: car.id,

  origin,

  destination,

  departureDateTime: new Date().toISOString(),

  availableSeats: seatsNumber,

  womenOnly,

  passengers: []

 });

 alert("Ride created");

 setOrigin("");
 setDestination("");
 setSeats("1");

}

 return (

  <View style={styles.container}>

   <Text style={styles.title}>
    Create Ride
   </Text>

   <TextInput
    placeholder="Origin"
    value={origin}
    onChangeText={setOrigin}
    style={styles.input}
   />

   <TextInput
    placeholder="Destination"
    value={destination}
    onChangeText={setDestination}
    style={styles.input}
   />

   <Text>
    Car:
   </Text>

   {cars.map(car => (

    <Button
     key={car.id}
     title={`${car.model} (${car.seatCapacity} seats)`}
     onPress={() => setSelectedCarId(car.id)}
    />

   ))}

    <TextInput
    placeholder={`1 - ${car?.seatCapacity ? car.seatCapacity - 1 : 0} seats`}
    value={seats}
    onChangeText={setSeats}
    keyboardType="numeric"
    style={styles.input}
    />

   <View style={styles.row}>

    <Text>
     Women only
    </Text>

    <Switch
     value={womenOnly}
     onValueChange={setWomenOnly}
    />

   </View>

   <Button
    title="Create Ride"
    onPress={handleCreateRide}
   />

  </View>

 );

}

const styles = StyleSheet.create({

 container: {

  flex: 1,
  padding: 20,
  gap: 10

 },

 title: {

  fontSize: 20,
  fontWeight: "bold"

 },

 input: {

  borderWidth: 1,
  padding: 10,
  borderRadius: 5

 },

 row: {

  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center"

 }

});
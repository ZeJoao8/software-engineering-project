import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { getRides } from "../../data/rides";

export default function PublishRide() {
  const router = useRouter();

  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [seats, setSeats] = useState("");

  function handlePublish() {
    // Scenario 2 — validação de campos obrigatórios
    if (!origin || !destination || !date || !time || !seats) {
      Alert.alert(
        "Error",
        "Please fill in all required fields before publishing the ride."
      );
      return;
    }

    // Scenario 1 — guardar a ride
    const rides = getRides();
    const newRide = {
      id: Date.now().toString(),
      origin,
      destination,
      departureDateTime: `${date}T${time}:00`,
      availableSeats: parseInt(seats),
      passengers: [],
      womenOnly: false,
      carId: "car1",
    };
    rides.push(newRide);

    Alert.alert("Success", "Ride published successfully!");
    router.replace("/(tabs)");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Publish Ride</Text>

      <TextInput
        testID="origin_field"
        style={styles.input}
        placeholder="Origin"
        value={origin}
        onChangeText={setOrigin}
      />

      <TextInput
        testID="destination_field"
        style={styles.input}
        placeholder="Destination"
        value={destination}
        onChangeText={setDestination}
      />

      <TextInput
        testID="date_field"
        style={styles.input}
        placeholder="Date (DD/MM/YYYY)"
        value={date}
        onChangeText={setDate}
      />

      <TextInput
        testID="time_field"
        style={styles.input}
        placeholder="Time (HH:MM)"
        value={time}
        onChangeText={setTime}
      />

      <TextInput
        testID="seats_field"
        style={styles.input}
        placeholder="Available seats"
        value={seats}
        onChangeText={setSeats}
        keyboardType="numeric"
      />

      <TouchableOpacity
        testID="publish_button"
        style={styles.button}
        onPress={handlePublish}
      >
        <Text style={styles.buttonText}>Publish</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#2E75B6",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
import { View, Text, Button, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { getRides, updateRide } from "../../data/rides";

export default function RideDetails() {

  const { id } = useLocalSearchParams();

  const router = useRouter();

  const ride = getRides().find(r => r.id === id);

  if (!ride) {

    return (

      <View style={styles.container}>

        <Text>
          Ride not found
        </Text>

      </View>

    );

  }

  function reserveSeat() {

  if (!ride) return;

  if (ride.availableSeats > 0) {

    const updatedRide = {

    ...ride,
    availableSeats: ride.availableSeats - 1

    };

    updateRide(updatedRide);

    alert("Seat reserved!");

    router.replace("/");

  }

  else {

    alert("Ride is full");

  }

  }

  return (

    <View style={styles.container}>

      <Text style={styles.title}>

        {ride.origin} → {ride.destination}

      </Text>

      <Text>

        Available seats: {ride.availableSeats}

      </Text>

      <Text>

        Women only: {ride.womenOnly ? "Yes" : "No"}

      </Text>

      <Button
        title="Reserve seat"
        onPress={reserveSeat}
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

    fontSize: 22,
    fontWeight: "bold"

  }

});
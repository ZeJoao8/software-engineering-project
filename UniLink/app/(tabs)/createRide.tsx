import { useState, useCallback } from "react";

import {
  ScrollView,
  View,
  Text,
  TextInput,
  Button,
  Switch,
  StyleSheet,
  TouchableOpacity
} from "react-native";

import { layout } from "../../styles/layout";
import { forms } from "../../styles/forms";
import { components } from "../../styles/components";
import { colors, spacing } from "../../styles/theme";

import { Picker } from "@react-native-picker/picker";

import DateTimePicker
  from "@react-native-community/datetimepicker";

import {
  addRide
} from "../../data/rides";

import {
  getUserCars
} from "../../data/cars";

import {
  getCurrentUser
} from "../../data/user";

import {
  useFocusEffect,
  useRouter
} from "expo-router";

import MapPicker from "../../components/MapPicker";
import RouteMap from "../../components/RouteMap";
import * as Location from "expo-location";
import { searchLocations } from "../../utils/location";

export default function CreateRide() {

  const router = useRouter();

  const [user, setUser] =
    useState(getCurrentUser());

  const [cars, setCars] =
    useState(getUserCars(user.email));

  const [origin, setOrigin] =
    useState("");

  const [destination, setDestination] =
    useState("");

  const [selectedCar, setSelectedCar] =
    useState<string | undefined>(
      cars[0]?.id
    );

  const [seats, setSeats] =
    useState("");

  const [womenOnly, setWomenOnly] =
    useState(false);

  const [originCoords, setOriginCoords] =
    useState<{ latitude: number; longitude: number } | undefined>();

  const [destinationCoords, setDestinationCoords] =
    useState<{ latitude: number; longitude: number } | undefined>();

  const [showOriginPicker, setShowOriginPicker] =
    useState(false);

  const [showDestinationPicker, setShowDestinationPicker] =
    useState(false);

  const now = new Date();

  const defaultDeparture = new Date();
  defaultDeparture.setMinutes(
    defaultDeparture.getMinutes() + 60
  );

  const [date, setDate] =
    useState(defaultDeparture);

  const [time, setTime] =
    useState(defaultDeparture);

  const [showDate, setShowDate] =
    useState(false);

  const [showTime, setShowTime] =
    useState(false);

  const [originSuggestions, setOriginSuggestions] =
    useState<any[]>([]);

  const [destinationSuggestions, setDestinationSuggestions] =
    useState<any[]>([]);


  useFocusEffect(

    useCallback(() => {

      const current = getCurrentUser();

      const userCars =
        getUserCars(current.email);
      setUser(current);
      setCars(userCars);
      setSelectedCar(
        userCars[0]?.id
      );

      setOrigin("");
      setDestination("");
      setOriginCoords(undefined);
      setDestinationCoords(undefined);
      setSeats("");
      setWomenOnly(false);

    }, [])

  );


  const car =
    cars.find(
      c => c.id === selectedCar
    );


  async function handleSelectOrigin(coords: { latitude: number; longitude: number }) {
    setOriginCoords(coords);
    try {
      const [address] = await Location.reverseGeocodeAsync(coords);
      if (address) {
        const name = address.street || address.name || `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`;
        setOrigin(name);
      }
    } catch {
      setOrigin(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
    }
  }

  async function handleSelectDestination(coords: { latitude: number; longitude: number }) {
    setDestinationCoords(coords);
    try {
      const [address] = await Location.reverseGeocodeAsync(coords);
      if (address) {
        const name = address.street || address.name || `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`;
        setDestination(name);
      }
    } catch {
      setDestination(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
    }
  }

  const fetchOriginSuggestions = async (text: string) => {
    setOrigin(text);
    if (text.length >= 3) {
      const results = await searchLocations(text);
      setOriginSuggestions(results);
    } else {
      setOriginSuggestions([]);
    }
  };

  const fetchDestinationSuggestions = async (text: string) => {
    setDestination(text);
    if (text.length >= 3) {
      const results = await searchLocations(text);
      setDestinationSuggestions(results);
    } else {
      setDestinationSuggestions([]);
    }
  };

  const selectOriginSuggestion = (suggestion: any) => {
    setOrigin(suggestion.name);
    setOriginCoords({ latitude: suggestion.latitude, longitude: suggestion.longitude });
    setOriginSuggestions([]);
  };

  const selectDestinationSuggestion = (suggestion: any) => {
    setDestination(suggestion.name);
    setDestinationCoords({ latitude: suggestion.latitude, longitude: suggestion.longitude });
    setDestinationSuggestions([]);
  };


  function createRide() {

    if (
      !origin.trim() ||
      !destination.trim() ||
      !car
    ) {
      alert("Fill all fields");
      return;
    }

    if (origin.trim().toLowerCase() ===
      destination.trim().toLowerCase()
    ) {
      alert("Origin and destination must differ");
      return;
    }

    const seatsNumber = Number(seats);

    if (!Number.isInteger(seatsNumber)) {
      alert("Seats must be integer");
      return;
    }

    if (seatsNumber < 1) {
      alert("Must allow at least 1 passenger");
      return;
    }

    if (seatsNumber > car.seatCapacity - 1) {
      alert(`Max passengers ${car.seatCapacity - 1}`);
      return;
    }

    const departure =
      new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        time.getHours(),
        time.getMinutes()
      );

    if (departure < new Date()) {
      alert("Cannot create ride in past");
      return;
    }

    addRide({

      id: Date.now().toString(),
      driverId: user.email,
      carId: car.id,
      origin: origin.trim(),
      destination: destination.trim(),
      originCoords,
      destinationCoords,
      departureDateTime: departure.toISOString(),
      availableSeats: seatsNumber,
      totalSeats: seatsNumber,
      womenOnly,
      passengers: [],
      completed: false
    });

    alert("Ride created");

    router.replace("/(tabs)/myRides");

  }

  if (cars.length === 0) {
    return (
      <View style={layout.screen}>

        <Text style={layout.title}>
          Create Ride
        </Text>

        <View style={components.card}>
          <Text style={layout.subtitle}>
            No car available
          </Text>
          <Text style={{ marginBottom: spacing.md }}>
            You need to add a car before creating a ride.
          </Text>
          <View style={components.button}>
            <Text
              style={components.buttonText}
              onPress={() => router.push("/(tabs)/userProfile")}
            >
              Go to profile
            </Text>
          </View>
        </View>
      </View>
    );
  }


  return (

    <ScrollView
      style={layout.scrollScreen}
      contentContainerStyle={{
        flexGrow: 1,
        padding: spacing.lg,
        paddingBottom: spacing.xl
      }}
      keyboardShouldPersistTaps="handled"
    >

      <Text style={layout.title}>
        Create Ride
      </Text>

      <View style={components.card}>

        <Text style={layout.subtitle}>
          Origin
        </Text>

        <TextInput
          placeholder="Origin"
          value={origin}
          maxLength={40}
          onChangeText={fetchOriginSuggestions}
          style={forms.input}
          testID="originInput"
        />

        {originSuggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            {originSuggestions.map((s, i) => (
              <TouchableOpacity
                key={i}
                style={styles.suggestionItem}
                onPress={() => selectOriginSuggestion(s)}
              >
                <Text style={styles.suggestionText}>{s.name}</Text>
                <Text style={styles.suggestionSubtext}>{s.city}, {s.country}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={components.outlineButton}>
          <Text
            style={components.outlineButtonText}
            onPress={() => setShowOriginPicker(true)}
          >
            {originCoords ? "Location Picked ✓" : "Pick on Map"}
          </Text>
        </View>

        <MapPicker
          visible={showOriginPicker}
          title="Pick Origin"
          onClose={() => setShowOriginPicker(false)}
          onSelect={handleSelectOrigin}
          initialLocation={originCoords}
        />

        <View style={{ height: 6 }} />

        <Text style={layout.subtitle}>
          Destination
        </Text>

        <TextInput
          placeholder="Destination"
          value={destination}
          maxLength={40}
          onChangeText={fetchDestinationSuggestions}
          style={forms.input}
          testID="destinationInput"
        />

        {destinationSuggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            {destinationSuggestions.map((s, i) => (
              <TouchableOpacity
                key={i}
                style={styles.suggestionItem}
                onPress={() => selectDestinationSuggestion(s)}
              >
                <Text style={styles.suggestionText}>{s.name}</Text>
                <Text style={styles.suggestionSubtext}>{s.city}, {s.country}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={components.outlineButton}>
          <Text
            style={components.outlineButtonText}
            onPress={() => setShowDestinationPicker(true)}
          >
            {destinationCoords ? "Location Picked ✓" : "Pick on Map"}
          </Text>
        </View>

        <MapPicker
          visible={showDestinationPicker}
          title="Pick Destination"
          onClose={() => setShowDestinationPicker(false)}
          onSelect={handleSelectDestination}
          initialLocation={destinationCoords}
        />

        {(originCoords || destinationCoords) && (
          <View style={{ marginTop: spacing.md }}>
            <RouteMap
              origin={originCoords}
              destination={destinationCoords}
              originName={origin || "Origin"}
              destinationName={destination || "Destination"}
            />
          </View>
        )}

      </View>


      <View style={components.card}>

        <Text style={layout.subtitle}>
          Date
        </Text>

        <View style={components.outlineButton}>
          <Text
            style={components.outlineButtonText}
            onPress={() => setShowDate(true)}
          >
            {date.toDateString()}
          </Text>
        </View>

        {showDate && (
          <DateTimePicker
            value={date}
            mode="date"
            onChange={(e, d) => {
              setShowDate(false);
              if (d) setDate(d);
            }}
          />
        )}

        <View style={{ height: 6 }} />


        <Text style={layout.subtitle}>
          Time
        </Text>

        <View style={components.outlineButton}>
          <Text
            style={components.outlineButtonText}
            onPress={() => setShowTime(true)}
          >
            {time.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            })
            }
          </Text>
        </View>

        {showTime && (
          <DateTimePicker
            value={time}
            mode="time"
            onChange={(e, t) => {
              setShowTime(false);
              if (t) setTime(t);
            }}
          />
        )}

        <View style={{ height: 6 }} />


        <Text style={layout.subtitle}>
          Car
        </Text>

        <View style={components.pickerWrapper}>

          <Picker
            selectedValue={selectedCar}
            onValueChange={setSelectedCar}
            dropdownIconColor={colors.primary}
            style={{ color: colors.primary, fontWeight: "600" }}
          >
            {cars.map(c => (
              <Picker.Item
                key={c.id}
                label={`${c.model} (${c.licensePlate})`}
                value={c.id}
                style={{ color: "black", fontWeight: "600" }}
              />
            ))}
          </Picker>

        </View>

        <View style={{ height: 6 }} />

        <Text style={layout.subtitle}>
          Seats
        </Text>
        <TextInput
          placeholder={`1-${car.seatCapacity - 1} seats`}
          value={seats}
          onChangeText={setSeats}
          keyboardType="numeric"
          style={forms.input}
        />

      </View>

      {user?.gender === "Female" && (

        <View style={components.card}>

          <View style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center"
          }}>

            <Text style={layout.subtitle}>
              Women only
            </Text>

            <Switch
              value={womenOnly}
              onValueChange={setWomenOnly}
              trackColor={{ false: "#d1d5db", true: "#fbcfe8" }}
              thumbColor={womenOnly ? "#ec4899" : "#f9fafb"}
            />
          </View>
        </View>
      )}

      <View style={components.button}>
        <Text
          style={components.buttonText}
          onPress={createRide}
          testID="createRideButton"
        >
          CREATE RIDE
        </Text>
      </View>
    </ScrollView>

  );

}

const styles = StyleSheet.create({
  suggestionsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: -8,
    marginBottom: spacing.md,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 1000,
  },
  suggestionItem: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  suggestionSubtext: {
    fontSize: 12,
    color: colors.textLight,
  },
});
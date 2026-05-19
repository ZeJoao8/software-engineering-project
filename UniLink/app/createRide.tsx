import { useState, useCallback, useEffect } from "react";

import {
  ScrollView,
  View,
  Text,
  TextInput,
  Switch,
  Pressable,
  Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { layout } from "../styles/layout";
import { forms } from "../styles/forms";
import { Button } from "../components/Button";
import { components } from "../styles/components";
import { colors, spacing } from "../styles/theme";

import DropDownPicker from "react-native-dropdown-picker";

import DateTimePicker
  from "@react-native-community/datetimepicker";

import {
  addRide
} from "../data/rides";

import {
  getUserCars,
  subscribeToCarsChanges
} from "../data/cars";
import { generateId } from "../infra/firebase";

import {
  getCurrentUser
} from "../data/user";

import {
  useFocusEffect,
  useRouter
} from "expo-router";

import LocationPickerMap from "../components/LocationPickerMap";
import RouteMap from "../components/RouteMap";
import AddressAutocomplete from "../components/AddressAutocomplete";
import type { Coordinates } from "../infra/routing";

export default function CreateRide() {

  const router = useRouter();

  const [user, setUser] =
    useState(getCurrentUser());

  const [cars, setCars] =
    useState(user ? getUserCars(user.uid) : []);

  const [origin, setOrigin] =
    useState("");

  const [destination, setDestination] =
    useState("");

  const [originCoords, setOriginCoords] =
    useState<Coordinates | null>(null);

  const [destinationCoords, setDestinationCoords] =
    useState<Coordinates | null>(null);

  const [showOriginPicker, setShowOriginPicker] =
    useState(false);

  const [showDestinationPicker, setShowDestinationPicker] =
    useState(false);

  const [selectedCar, setSelectedCar] =
    useState<string | null>(cars[0]?.id ?? null);

  const [seats, setSeats] =
    useState("");

  const [womenOnly, setWomenOnly] =
    useState(false);

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

  const [carDropdownOpen, setCarDropdownOpen] = useState(false);

  const carItems = cars.map(c => ({
    label: `${c.model} (${c.licensePlate})`,
    value: c.id
  }));

  useFocusEffect(

    useCallback(() => {

      const current = getCurrentUser();

      const userCars = current ? getUserCars(current.uid) : [];
      setUser(current);
      setCars(userCars);
      setSelectedCar(
        userCars[0]?.id
      );

      setOrigin("");
      setDestination("");
      setOriginCoords(null);
      setDestinationCoords(null);
      setSeats("");
      setWomenOnly(false);

    }, [])

  );

  useEffect(() => {
    return subscribeToCarsChanges(() => {
      const current = getCurrentUser();
      const nextCars = current ? getUserCars(current.uid) : [];

      setCars(nextCars);
      setSelectedCar(currentSelected =>
        nextCars.some(
          car => car.id === currentSelected
        )
          ? currentSelected
          : nextCars[0]?.id
      );
    });
  }, []);

  if (!user) {
    return null;
  }

  const activeUser = user;


  async function createRide() {

    const car =
      cars.find(
        c => c.id === selectedCar
      );

    if (
      !origin.trim() ||
      !destination.trim() ||
      !car
    ) {
      Alert.alert("Error", "Fill all fields");
      return;
    }

    if (!originCoords || !destinationCoords) {
      Alert.alert("Error", "Please select a real location.");
      return;
    }

    if (origin.trim().toLowerCase() ===
      destination.trim().toLowerCase()
    ) {
      Alert.alert("Error", "Origin and destination must differ");
      return;
    }

    const seatsNumber = Number(seats);

    if (!Number.isInteger(seatsNumber)) {
      Alert.alert("Error", "Seats must be integer");
      return;
    }

    if (seatsNumber < 1) {
      Alert.alert("Error", "Must allow at least 1 passenger");
      return;
    }

    if (seatsNumber > car.seatCapacity - 1) {
      Alert.alert("Error", `Max passengers ${car.seatCapacity - 1}`);
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
      Alert.alert("Error", "Cannot create ride in past");
      return;
    }

    await addRide({

      id: generateId("rides"),
      driverId: activeUser.uid,
      carId: car.id,
      origin: origin.trim(),
      destination: destination.trim(),
      departureDateTime: departure.toISOString(),
      availableSeats: seatsNumber,
      totalSeats: seatsNumber,
      womenOnly,
      passengers: [],
      completed: false,
      ...(originCoords && { originCoords }),
      ...(destinationCoords && { destinationCoords }),
    });

    Alert.alert("Success", "Ride created");

    router.replace("/(tabs)/myRides");

  }

  if (cars.length === 0) {
    return (
      <SafeAreaView style={layout.screen}>
        <View style={{ padding: spacing.lg, flex: 1 }}>
          <Pressable onPress={() => router.back()} style={{ marginBottom: spacing.md }}>
            <Text style={layout.backLink}>← Back</Text>
          </Pressable>

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
            <Button
              testID="createRideGoToProfileButton"
              onPress={() => router.push("/(tabs)/userProfile")}
              label="Go to profile"
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const car =
    cars.find(
      currentCar =>
        currentCar.id === selectedCar
    ) ?? cars[0];


  return (
    <SafeAreaView style={layout.scrollScreen}>
      <ScrollView
        style={layout.scrollScreen}
        contentContainerStyle={layout.scrollContentLg}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => router.back()} style={{ marginBottom: spacing.md }}>
          <Text style={layout.link}>← Back</Text>
        </Pressable>

        <Text style={layout.title}>
          Create Ride
        </Text>

        <View style={[components.card, { zIndex: 20 }]}>

        <Text style={layout.subtitle}>
          Origin
        </Text>

        <AddressAutocomplete
          placeholder="Search origin..."
          value={origin}
          onChangeText={(text) => {
            setOrigin(text);
            setOriginCoords(null);
          }}
          onSelect={(name, coords) => {
            setOrigin(name);
            setOriginCoords(coords);
          }}
          testID="createRideOriginInput"
        />

        <Pressable
          style={components.mapActionRow}
          onPress={() => setShowOriginPicker(true)}
          testID="createRideOriginMapButton"
        >
          <Text style={layout.mapActionText}>🗺️ Or choose on map</Text>
          {originCoords && (
            <Text style={layout.confirmationText}>✓ Location defined</Text>
          )}
        </Pressable>


        <Text style={layout.subtitle}>
          Destination
        </Text>

        <AddressAutocomplete
          placeholder="Search destination..."
          value={destination}
          onChangeText={(text) => {
            setDestination(text);
            setDestinationCoords(null);
          }}
          onSelect={(name, coords) => {
            setDestination(name);
            setDestinationCoords(coords);
          }}
          testID="createRideDestinationInput"
        />

        <Pressable
          style={components.mapActionRow}
          onPress={() => setShowDestinationPicker(true)}
          testID="createRideDestinationMapButton"
        >
          <Text style={layout.mapActionText}>🗺️ Or choose on map</Text>
          {destinationCoords && (
            <Text style={layout.confirmationText}>✓ Location defined</Text>
          )}
        </Pressable>

      </View>


      {/* Route preview */}
      {originCoords && destinationCoords && (
        <View style={[components.card, components.cardMap]}>
          <RouteMap
            origin={originCoords}
            destination={destinationCoords}
            originLabel={origin}
            destinationLabel={destination}
            height={200}
          />
        </View>
      )}


      <View style={components.card}>

        <Text style={layout.subtitle}>
          Date
        </Text>

        <Button
          outline
          testID="createRideDateButton"
          onPress={() => setShowDate(true)}
          label={date.toDateString()}
        />

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

        <View style={components.spacerXs} />


        <Text style={layout.subtitle}>
          Time
        </Text>

        <Button
          outline
          testID="createRideTimeButton"
          onPress={() => setShowTime(true)}
          label={time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        />

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

        <View style={components.spacerXs} />


        <Text style={layout.subtitle}>
          Car
        </Text>

        <View style={components.pickerWrapper}>

          <DropDownPicker
            open={carDropdownOpen}
            value={selectedCar}
            items={carItems}

            setOpen={setCarDropdownOpen}
            setValue={setSelectedCar}

            placeholder="Select car"
            testID="createRideCarPicker"

            style={components.dropdown}

            dropDownContainerStyle={
              components.dropdownContainer
            }

            textStyle={components.dropdownText}

            placeholderStyle={
              components.dropdownPlaceholder
            }

            listMode="SCROLLVIEW"

            scrollViewProps={{
              nestedScrollEnabled: true
            }}
          />

        </View>

        <View style={components.spacerXs} />

        <Text style={layout.subtitle}>
          Seats
        </Text>
        <TextInput
          placeholder={`1-${car.seatCapacity - 1} seats`}
          placeholderTextColor={colors.textLight}
          value={seats}
          onChangeText={setSeats}
          keyboardType="numeric"
          style={forms.input}
          testID="createRideSeatsInput"
        />

      </View>

      {activeUser.gender === "Female" && (

        <View style={components.card}>

          <View style={components.rowSpaceBetween}>

            <Text style={layout.subtitle}>
              Women only
            </Text>

            <Switch
              value={womenOnly}
              onValueChange={setWomenOnly}
              testID="createRideWomenOnlySwitch"
              trackColor={{ false: colors.switchTrackOff, true: colors.switchTrackOn }}
              thumbColor={womenOnly ? colors.women : colors.switchThumbOff}
            />
          </View>
        </View>
      )}

      <Button
        testID="createRideButton"
        onPress={() => void createRide()}
        label="CREATE RIDE"
      />


      {/* Location picker modals */}
      <LocationPickerMap
        visible={showOriginPicker}
        onClose={() => setShowOriginPicker(false)}
        title="Select origin"
        onConfirm={(coords, name) => {
          setOriginCoords(coords);
          setOrigin(name);
          setShowOriginPicker(false);
        }}
      />

      <LocationPickerMap
        visible={showDestinationPicker}
        onClose={() => setShowDestinationPicker(false)}
        title="Select destination"
        onConfirm={(coords, name) => {
          setDestinationCoords(coords);
          setDestination(name);
          setShowDestinationPicker(false);
        }}
      />

      </ScrollView>
    </SafeAreaView>
  );
}

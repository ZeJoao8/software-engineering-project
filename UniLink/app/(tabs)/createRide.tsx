import { useState, useCallback, useEffect } from "react";

import {
  ScrollView,
  View,
  Text,
  TextInput,
  Switch,
  Pressable
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
  getUserCars,
  subscribeToCarsChanges
} from "../../data/cars";

import {
  getCurrentUser
} from "../../data/user";

import {
  useFocusEffect,
  useRouter
} from "expo-router";

export default function CreateRide() {

  const router = useRouter();

  const [user, setUser] =
    useState(getCurrentUser());

  const [cars, setCars] =
    useState(
      user
        ? getUserCars(
            user.uid,
            user.email
          )
        : []
    );

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

  useFocusEffect(

    useCallback(() => {

      const current = getCurrentUser();

      const userCars =
        current
          ? getUserCars(
              current.uid,
              current.email
            )
          : [];
      setUser(current);
      setCars(userCars);
      setSelectedCar(
        userCars[0]?.id
      );

      setOrigin("");
      setDestination("");
      setSeats("");
      setWomenOnly(false);

    }, [])

  );

  useEffect(() => {
    return subscribeToCarsChanges(() => {
      const current = getCurrentUser();
      const nextCars =
        current
          ? getUserCars(
              current.uid,
              current.email
            )
          : [];

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

    await addRide({

      id: Date.now().toString(),
      driverId: activeUser.uid,
      carId: car.id,
      origin: origin.trim(),
      destination: destination.trim(),
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
          <Pressable style={components.button}  onPress={() => router.push("/(tabs)/userProfile")}>
            <Text
              style={components.buttonText}
            >
              Go to profile
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const car =
    cars.find(
      currentCar =>
        currentCar.id === selectedCar
    ) ?? cars[0];


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
          onChangeText={setOrigin}
          style={forms.input}
          testID="originInput"
        />

        <View style={{ height: 6 }} />

        <Text style={layout.subtitle}>
          Destination
        </Text>

        <TextInput
          placeholder="Destination"
          value={destination}
          maxLength={40}
          onChangeText={setDestination}
          style={forms.input}
          testID="destinationInput"
        />

      </View>


      <View style={components.card}>

        <Text style={layout.subtitle}>
          Date
        </Text>

        <Pressable style={components.outlineButton} onPress={() => setShowDate(true)}>
          <Text
            style={components.outlineButtonText}
          >
            {date.toDateString()}
          </Text>
        </Pressable>

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

        <Pressable style={components.outlineButton} onPress={() => setShowTime(true)}>
          <Text
            style={components.outlineButtonText}
          >
            {time.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            })
            }
          </Text>
        </Pressable>

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

      {activeUser.gender === "Female" && (

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

      <Pressable style={components.button} onPress={() => void createRide()}>
        <Text
          style={components.buttonText}
          testID="createRideButton"
        >
          CREATE RIDE
        </Text>
      </Pressable>
    </ScrollView>

  );

}

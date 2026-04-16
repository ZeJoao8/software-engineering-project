import { useEffect, useState } from "react";

import {
  View,
  Text,
  TextInput,
  Alert,
  ScrollView,
  Pressable
} from "react-native";

import {
  getCurrentUser,
  updateUser,
  logoutUser
} from "../../data/user";

import {
  getUserCars,
  addCar,
  deleteCar,
  subscribeToCarsChanges
} from "../../data/cars";

import {
  getRides,
  deleteRide,
  subscribeToRidesChanges
} from "../../data/rides";

import {
  getAverageRatingForUser,
  getReviewsForUser,
  subscribeToReviewsChanges
} from "../../data/reviews";

import { useRouter }
  from "expo-router";

import { components } from "../../styles/components";
import { forms } from "../../styles/forms";
import { layout } from "../../styles/layout";
import { colors, spacing } from "../../styles/theme";

export default function Profile() {

  const router = useRouter();

  const [user, setUser] =
    useState(getCurrentUser());

  const [editing, setEditing] =
    useState(false);

  const [showCarForm, setShowCarForm] =
    useState(false);

  const [model, setModel] =
    useState("");

  const [color, setColor] =
    useState("");

  const [plate, setPlate] =
    useState("");

  const [seats, setSeats] =
    useState("");

  const [, setVersion] =
    useState(0);

  useEffect(() => {
    const rerender = () => {
      setVersion(value => value + 1);
    };

    const unsubscribeCars =
      subscribeToCarsChanges(rerender);

    const unsubscribeRides =
      subscribeToRidesChanges(rerender);

    const unsubscribeReviews =
      subscribeToReviewsChanges(rerender);

    return () => {
      unsubscribeCars();
      unsubscribeRides();
      unsubscribeReviews();
    };
    }, []);
    
  if (!user) {
    return null;
  }

  const activeUser = user;

  const userCars =
    getUserCars(
      activeUser.uid,
      activeUser.email
    );
  
  const hasDrivenRide =
    getRides().some(
      ride =>
        ride.driverId === activeUser.uid ||
        ride.driverId === activeUser.email
    );

  const userReviews =
    getReviewsForUser(
      activeUser.uid,
      activeUser.email
    );

  const averageRating =
    getAverageRatingForUser(
      activeUser.uid,
      activeUser.email
    );

  // Show rating if has driven a ride AND has reviews (same logic as public profile)
  const showRating =
    hasDrivenRide &&
    userReviews.length > 0;

  function startEdit() {
    setEditing(true);
  }

  function cancelEdit() {
    const current =
      getCurrentUser();

    if (current) {
      setUser(current);
    }

    setEditing(false);
    setShowCarForm(false);
    setModel("");
    setColor("");
    setPlate("");
    setSeats("");
  }

  async function saveProfile() {
    await updateUser(activeUser);
    setUser({ ...activeUser });
    setEditing(false);
    Alert.alert("Saved");
  }

  function removeCar(carId: string) {
    const ridesUsingCar =
      getRides().filter(
        r =>
          r.carId === carId &&
          !r.completed &&
          new Date(r.departureDateTime) > new Date()
      );
    const warningText =
      ridesUsingCar.length > 0
        ? `This will cancel ${ridesUsingCar.length} future ride(s) using this car.`
        : "Are you sure you want to remove this car?";
    Alert.alert(
      "Remove car",
      warningText,
      [
        {
          text: "No",
          style: "cancel"
        },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            await Promise.all(
              ridesUsingCar.map(
                ride => deleteRide(ride.id)
              )
            );
            await deleteCar(carId);
            const current =
              getCurrentUser();

            if (current) {
              setUser({ ...current });
            }
          }
        }
      ]
    );
  }

  async function addNewCar() {
    if (
      !model.trim() ||
      !color.trim() ||
      !plate.trim() ||
      !seats.trim()
    ) {
      Alert.alert("Fill all fields");
      return;
    }
    if (model.length > 40) {
      Alert.alert("Model max 40 chars");
      return;
    }
    const seatsNumber = Number(seats);
    if (
      !Number.isInteger(seatsNumber) ||
      seatsNumber <= 0
    ) {
      Alert.alert("Seats must be integer > 0");
      return;
    }
    const formattedPlate =
      plate.toUpperCase().replace(/\s/g, "");
    const plateRegex = /^[A-Z0-9-]{6,8}$/;
    if (!plateRegex.test(formattedPlate)) {
      Alert.alert("Invalid plate format");
      return;
    }
    const duplicate =
      getUserCars(
        activeUser.uid,
        activeUser.email
      )
        .some(
          c =>
            c.licensePlate ===
            formattedPlate
        );
    if (duplicate) {
      Alert.alert("Plate already exists");
      return;
    }
    await addCar({
      id: Date.now().toString(),
      model: model.trim(),
      color: color.trim(),
      licensePlate: formattedPlate,
      seatCapacity: seatsNumber,
      ownerId: activeUser.uid
    });
    setModel("");
    setColor("");
    setPlate("");
    setSeats("");
    setShowCarForm(false);
  }

  return (

    <View style={{ flex: 1, backgroundColor: colors.primarySoft }}>
      <ScrollView
        style={layout.scrollScreen}
        contentContainerStyle={{
          flexGrow: 1,
          padding: spacing.lg,
          paddingBottom: 80
        }}
        keyboardDismissMode="on-drag"
      >

      <Text style={layout.title}>
        Profile
      </Text>

      {/* OWN RATING — same display as public profile */}
      {showRating && (
        <Text
          style={{
            marginBottom: spacing.md,
            color: colors.textLight,
            fontSize: 16
          }}
        >
          ⭐ {averageRating} ({userReviews.length} {userReviews.length === 1 ? "rating" : "ratings"})
        </Text>
      )}

      {/* USER INFO */}
      <View style={components.card}>

        <Text style={layout.subtitle}>
          Info
        </Text>

        <Text style={forms.label}>
          Name
        </Text>

        {editing ? (
          <TextInput
            value={activeUser.name}
            onChangeText={t =>
              setUser({ ...activeUser, name: t })
            }
            style={forms.input}
            testID="profileNameInput"
          />
        ) : (
          <Text>{activeUser.name}</Text>
        )}


        <View style={{ height: spacing.sm }} />

        <Text style={forms.label}>
          Gender
        </Text>

        <Text>
          {activeUser.gender}
        </Text>


        <View style={{ height: spacing.sm }} />

        <Text style={forms.label}>
          University
        </Text>

        <Text>
          {activeUser.university}
        </Text>


        <View style={{ height: spacing.sm }} />

        <Text style={forms.label}>
          Course
        </Text>

        {editing ? (
          <TextInput
            value={activeUser.course}
            onChangeText={t =>
              setUser({ ...activeUser, course: t })
            }
            style={forms.input}
            testID="profileCourseInput"
          />
        ) : (
          <Text>
            {activeUser.course}
          </Text>
        )}


        <View style={{ height: spacing.md }} />

        {!editing ? (

          <Pressable
            style={components.outlineButton}
            testID="editProfileButton"
            onPress={startEdit}
          >
            <Text
              style={components.outlineButtonText}
            >
              Edit profile
            </Text>
          </Pressable>

        ) : (

          <>
            <Pressable
              style={components.button}
              testID="saveProfileButton"
              onPress={saveProfile}
            >
              <Text
                style={components.buttonText}
              >
                Save profile
              </Text>
            </Pressable>

            <View style={{ height: spacing.sm }} />

            <Pressable
              style={components.outlineButton}
              testID="cancelProfileEditButton"
              onPress={cancelEdit}
            >
              <Text
                style={components.outlineButtonText}
              >
                Cancel
              </Text>
            </Pressable>
          </>

        )}

      </View>



      {/* CARS */}
      <View style={components.card}>

        <Text style={layout.subtitle}>
          My cars
        </Text>


        {userCars.length === 0 && (
          <Text style={{ color: colors.textLight }}>
            No cars yet
          </Text>
        )}


        {userCars.map(car => (

          <View
            key={car.id}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: spacing.sm
            }}
          >

            <Text>
              {car.model} • {car.licensePlate}
            </Text>


            {editing && (

              <Text
                style={{
                  color: colors.danger,
                  fontWeight: "600"
                }}
                onPress={() =>
                  removeCar(car.id)
                }
              >
                remove
              </Text>

            )}

          </View>

        ))}


        {editing && (

          <View style={{ marginTop: spacing.sm }}>

            <Pressable
              style={components.outlineButton}
              testID="toggleAddCarButton"
              onPress={() => setShowCarForm(!showCarForm)}
            >
              <Text
                style={components.outlineButtonText}
              >
                {showCarForm ? "Cancel" : "Add car"}
              </Text>
            </Pressable>

          </View>

        )}

      </View>



      {editing && showCarForm && (

        <View style={components.card}>

          <Text style={layout.subtitle}>
            Add car
          </Text>


          <Text style={forms.label}>
            Model
          </Text>

          <TextInput
            value={model}
            onChangeText={setModel}
            style={forms.input}
            testID="carModelInput"
          />


          <View style={{ height: spacing.sm }} />

          <Text style={forms.label}>
            Color
          </Text>

          <TextInput
            value={color}
            onChangeText={setColor}
            style={forms.input}
            testID="carColorInput"
          />


          <View style={{ height: spacing.sm }} />

          <Text style={forms.label}>
            Plate
          </Text>

          <TextInput
            value={plate}
            onChangeText={setPlate}
            autoCapitalize="characters"
            style={forms.input}
            testID="carPlateInput"
          />


          <View style={{ height: spacing.sm }} />

          <Text style={forms.label}>
            Seats
          </Text>

          <TextInput
            value={seats}
            onChangeText={setSeats}
            keyboardType="numeric"
            style={forms.input}
            testID="carSeatsInput"
          />


          <View style={{ marginTop: spacing.md }}>

            <Pressable
              style={components.button}
              testID="saveCarButton"
              onPress={() => void addNewCar()}
            >
              <Text
                style={components.buttonText}
              >
                Save car
              </Text>
            </Pressable>

          </View>

        </View>

      )}



      {/* LOGOUT */}
      <View style={components.card}>

        <Text style={layout.subtitle}>
          Session
        </Text>


        <Pressable
          style={components.button}
          testID="logoutButton"
          onPress={() =>
              Alert.alert(
                "Logout",
                "Are you sure?",
                [
                  { text: "Cancel" },
                  {
                    text: "Logout",
                    style: "destructive",

                    onPress: async () => {
                      await logoutUser();
                      router.replace("/login");
                    }
                  }
                ]
              )
            }
          >
          <Text
            style={components.buttonText}
          >
            Logout
          </Text>
        </Pressable>
      </View>

    </ScrollView>
    </View>

  );
}

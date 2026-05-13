import { useEffect, useState } from "react";

import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from "react-native";

import {
  getCurrentUser,
  logoutUser,
  updateUser
} from "../../data/user";

import {
  addCar,
  deleteCar,
  getUserCars,
  subscribeToCarsChanges
} from "../../data/cars";
import { generateId } from "../../lib/firebase";

import {
  deleteRide,
  getRides,
  subscribeToRidesChanges
} from "../../data/rides";

import {
  getAverageRatingForUser,
  getReviewsForUser,
  subscribeToReviewsChanges
} from "../../data/reviews";

import { useRouter } from "expo-router";

import { BadgeDisplay } from "../../components/BadgeDisplay";
import { Button } from "../../components/Button";
import { components } from "../../styles/components";
import { forms } from "../../styles/forms";
import { layout } from "../../styles/layout";
import { colors, spacing, radius } from "../../styles/theme";
import { getUserBadges } from "../../utils/badges";
import { calculateWeeklyStreak } from "../../utils/streaks";
import { calculateUserCO2Saved } from "../../utils/sustainability";

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

  const userCars = getUserCars(activeUser.uid);

  const hasDrivenRide =
    getRides().some(
    ride => ride.driverId === activeUser.uid
    );

  const userReviews = getReviewsForUser(activeUser.uid);

  const averageRating = getAverageRatingForUser(activeUser.uid);

  // Show rating if has driven a ride AND has reviews (same logic as public profile)
  const showRating =
    hasDrivenRide &&
    userReviews.length > 0;

  const weeklyStreak =
  calculateWeeklyStreak(
    getRides(),
    activeUser.uid
  );

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
      seatsNumber < 2 || seatsNumber > 9
    ) {
      Alert.alert("Invalid seat number","Seats must be integer between 2 and 9");
      return;
    }
    const formattedPlate =
      plate.toUpperCase().replace(/\s/g, "");
    const plateRegex = /^[A-Z0-9-]{6,8}$/;
    if (!plateRegex.test(formattedPlate)) {
      Alert.alert("Invalid plate format");
      return;
    }
    const duplicate = getUserCars(activeUser.uid)
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
      id: generateId("cars"),
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

    <ScrollView
      style={layout.scrollScreen}
      contentContainerStyle={layout.scrollContentTab}
      keyboardDismissMode="on-drag"
    >

      <Text style={layout.title}>
        Profile
      </Text>

      {/* OWN RATING — same display as public profile */}
      {showRating && (
        <Text style={layout.ratingText}>
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


        <View style={components.spacerSm} />
        
        <Text style={forms.label}>
          E-mail
        </Text>

        <Text>
          {activeUser.email}
        </Text>

        <View style={components.spacerSm} />
        
        <Text style={forms.label}>
          Gender
        </Text>

        <Text>
          {activeUser.gender}
        </Text>


        <View style={components.spacerSm} />

        <Text style={forms.label}>
          University
        </Text>

        <Text>
          {activeUser.university}
        </Text>


        <View style={components.spacerSm} />

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


        <View style={components.spacerMd} />

        <Text style={layout.subtitle}>
          My cars
        </Text>

        {userCars.length === 0 && (
          <Text style={layout.textLight}>No cars yet</Text>
        )}

        {userCars.map(car => (
          <View key={car.id} style={[components.rowSpaceBetween, components.mbSm]}>
            <Text>
              {car.model} • {car.color} • {car.licensePlate}
            </Text>

            {editing && (
              <Pressable style={components.dangerTag} onPress={() => removeCar(car.id)}>
                <Text style={components.dangerTagText}>Remove</Text>
              </Pressable>
            )}
          </View>
        ))}

        {editing && (
          <View style={components.mtMd}>
            <Button
              outline
              testID="toggleAddCarButton"
              onPress={() => setShowCarForm(!showCarForm)}
              label={showCarForm ? "Cancel" : "Add car"}
            />
          </View>
        )}

        {editing && showCarForm && (
          <View style={[components.mtMd, { padding: spacing.md, backgroundColor: colors.background, borderRadius: radius.sm }]}>
            <Text style={layout.subtitle}>Add car details</Text>

            <Text style={forms.label}>Model</Text>
            <TextInput value={model} onChangeText={setModel} style={forms.input} testID="carModelInput" />
            <View style={components.spacerSm} />

            <Text style={forms.label}>Color</Text>
            <TextInput value={color} onChangeText={setColor} style={forms.input} testID="carColorInput" />
            <View style={components.spacerSm} />

            <Text style={forms.label}>Plate</Text>
            <TextInput value={plate} onChangeText={setPlate} autoCapitalize="characters" style={forms.input} testID="carPlateInput" />
            <View style={components.spacerSm} />

            <Text style={forms.label}>Seats</Text>
            <TextInput value={seats} onChangeText={setSeats} keyboardType="numeric" style={forms.input} testID="carSeatsInput" />

            <View style={components.mtMd}>
              <Button testID="saveCarButton" onPress={() => void addNewCar()} label="Save car" />
            </View>
          </View>
        )}

        <View style={components.spacerLg} />

        {!editing ? (

          <Button
            outline
            testID="editProfileButton"
            onPress={startEdit}
            label="Edit profile"
          />

        ) : (

          <>
            <Button
              testID="saveProfileButton"
              onPress={saveProfile}
              label="Save profile"
            />

            <View style={components.spacerSm} />

            <Button
              outline
              testID="cancelProfileEditButton"
              onPress={cancelEdit}
              label="Cancel"
            />
          </>

        )}

      </View>
      <View style={components.card}>
        <Text style={layout.subtitle}>Weekly Streak</Text>
        <View style={components.statRow}>
          <Text style={layout.emojiLg}>🔥</Text>
          <View>
            <Text style={layout.statValue}>{weeklyStreak}</Text>
            <Text style={layout.statLabel}>
              {weeklyStreak === 1 ? "week in a row" : "weeks in a row"}
            </Text>
          </View>
        </View>
      </View>

      <View style={components.card}>
        <Text style={layout.subtitle}>Sustainability Impact</Text>
        <View style={components.statRow}>
          <Text style={layout.emojiLg}>🌳</Text>
          <View>
            <Text style={layout.statValue}>
              {calculateUserCO2Saved(getRides(), activeUser.uid).toFixed(2)} kg
            </Text>
            <Text style={layout.statLabel}>Total CO₂ saved</Text>
          </View>
        </View>
      </View>

      {/* BADGES & ACHIEVEMENTS */}
      <View style={components.card}>
        <Text style={layout.subtitle}>Achievements</Text>
        <BadgeDisplay 
          showProgress={true}
          badges={getUserBadges(
            activeUser.uid,
            getRides(),
            calculateUserCO2Saved(getRides(), activeUser.uid)
          )} 
        />
      </View>





      {/* LOGOUT */}
      <View style={components.card}>

        <Text style={layout.subtitle}>
          Session
        </Text>


        <Button
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
          label="Logout"
        />
      </View>

    </ScrollView>

  );
}

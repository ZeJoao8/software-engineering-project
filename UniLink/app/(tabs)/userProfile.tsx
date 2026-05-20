import { useEffect, useState } from "react";

import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from "react-native";

import { useAuth } from "../../hooks/useAuth";
import { useCars } from "../../hooks/useCars";
import { useRides } from "../../hooks/useRides";
import { useReviews } from "../../hooks/useReviews";
import { logout } from "../../services/AuthService";
import { updateProfile } from "../../services/ProfileService";
import { addCar, removeCarCascade } from "../../services/CarService";
import { calculateAverageRating } from "../../domain/rules/reviewRules";
import { hasUserDrivenRide } from "../../domain/rules/rideRules";

import { useRouter } from "expo-router";

import { BadgeDisplay } from "../../components/BadgeDisplay";
import { Button } from "../../components/Button";
import { components } from "../../styles/components";
import { forms } from "../../styles/forms";
import { layout } from "../../styles/layout";
import { colors, spacing, radius } from "../../styles/theme";
import { getUserBadges } from "../../domain/rules/badges";
import { calculateWeeklyStreak } from "../../domain/rules/streaks";
import { calculateUserCO2Saved } from "../../domain/rules/sustainability";
import type { User } from "../../domain/entities/User";

export default function Profile() {

  const router = useRouter();

  const { user: currentUser } = useAuth();
  const { cars } = useCars();
  const rides = useRides();
  const { getReviewsForUser } = useReviews();

  const [editUser, setEditUser] = useState<User | null>(currentUser);
  const [editing, setEditing] = useState(false);
  const [showCarForm, setShowCarForm] = useState(false);
  const [model, setModel] = useState("");
  const [color, setColor] = useState("");
  const [plate, setPlate] = useState("");
  const [seats, setSeats] = useState("");

  // Sync editUser with store when not editing
  useEffect(() => {
    if (!editing) setEditUser(currentUser);
  }, [currentUser, editing]);

  if (!currentUser) return null;

  const activeUser = editing ? (editUser ?? currentUser) : currentUser;

  const userReviews = getReviewsForUser(currentUser.uid);
  const averageRating = calculateAverageRating(userReviews);

  const hasDrivenRide = hasUserDrivenRide(rides, currentUser.uid);
  const showRating = hasDrivenRide && userReviews.length > 0;

  const weeklyStreak = calculateWeeklyStreak(rides, currentUser.uid);
  const co2Saved = calculateUserCO2Saved(rides, currentUser.uid);

  function startEdit() {
    setEditUser(currentUser);
    setEditing(true);
  }

  function cancelEdit() {
    setEditUser(currentUser);
    setEditing(false);
    setShowCarForm(false);
    setModel("");
    setColor("");
    setPlate("");
    setSeats("");
  }

  async function saveProfile() {
    if (!editUser) return;
    const result = await updateProfile(editUser);
    if (!result.ok) {
      Alert.alert("Error", result.error);
      return;
    }
    setEditing(false);
    Alert.alert("Saved");
  }

  function removeCar(carId: string) {
    const ridesUsingCar = rides.filter(
      r => r.carId === carId && !r.completed && new Date(r.departureDateTime) > new Date()
    );
    const warningText = ridesUsingCar.length > 0
      ? `This will cancel ${ridesUsingCar.length} future ride(s) using this car.`
      : "Are you sure you want to remove this car?";

    Alert.alert("Remove car", warningText, [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        style: "destructive",
        onPress: async () => {
          const result = await removeCarCascade(carId);
          if (!result.ok) {
            Alert.alert("Error", result.error);
          }
        }
      }
    ]);
  }

  async function addNewCar() {
    if (!currentUser) return;
    const result = await addCar(model, color, plate, seats, currentUser.uid);
    if (!result.ok) {
      Alert.alert("Error", result.error);
      return;
    }
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
            onChangeText={t => setEditUser(prev => prev ? { ...prev, name: t } : prev)}
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
            onChangeText={t => setEditUser(prev => prev ? { ...prev, course: t } : prev)}
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

        {cars.length === 0 && (
          <Text style={layout.textLight}>No cars yet</Text>
        )}

        {cars.map(car => (
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
              onPress={() => void saveProfile()}
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
              {co2Saved.toFixed(2)} kg
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
          badges={getUserBadges(currentUser.uid, rides, co2Saved)}
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
                    await logout();
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

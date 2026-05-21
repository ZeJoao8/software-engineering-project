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
import { hasUserDrivenRide, getActiveRidesForCar } from "../../domain/rules/rideRules";
import { useFriends } from "../../hooks/useFriends";
import {
  acceptFriendRequest,
  removeFriend,
} from "../../services/FriendService";

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

  const { user: currentUser, getUserById } = useAuth();
  const { cars } = useCars();
  const rides = useRides();
  const { getReviewsForUser } = useReviews();
  const { getAcceptedFriendIds, getPendingReceivedRequests } = useFriends();

  const [editUser, setEditUser] = useState<User | null>(currentUser);
  const [editing, setEditing] = useState(false);
  const [showCarForm, setShowCarForm] = useState(false);
  const [model, setModel] = useState("");
  const [color, setColor] = useState("");
  const [plate, setPlate] = useState("");
  const [seats, setSeats] = useState("");

  const [showContactForm, setShowContactForm] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");

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
    setShowContactForm(false);
    setContactName("");
    setContactPhone("");
  }

  function addContact() {
    if (!contactName.trim() && !contactPhone.trim()) return;
    setEditUser(prev =>
      prev
        ? { ...prev, emergencyContacts: [...(prev.emergencyContacts ?? []), { name: contactName.trim(), phone: contactPhone.trim() }] }
        : prev
    );
    setContactName("");
    setContactPhone("");
    setShowContactForm(false);
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
    const ridesUsingCar = getActiveRidesForCar(rides, carId, new Date());
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


        <View style={components.spacerSm} />

        <Text style={layout.subtitle}>
          Safety Contacts
        </Text>

        {(currentUser.emergencyContacts ?? []).length === 0 && !editing && (
          <Text style={layout.textLight}>No safety contacts</Text>
        )}

        {(editing ? (editUser?.emergencyContacts ?? []) : (currentUser.emergencyContacts ?? [])).map((c, i) => (
          <View key={i} style={[components.rowSpaceBetween, components.mbSm]}>
            <Text>{c.name} · {c.phone}</Text>
            {editing && (
              <Pressable
                style={components.dangerTag}
                onPress={() =>
                  setEditUser(prev =>
                    prev
                      ? { ...prev, emergencyContacts: (prev.emergencyContacts ?? []).filter((_, j) => j !== i) }
                      : prev
                  )
                }
              >
                <Text style={components.dangerTagText}>Remove</Text>
              </Pressable>
            )}
          </View>
        ))}

        {editing && (
          <View style={components.mtMd}>
            <Button
              outline
              onPress={() => setShowContactForm(f => !f)}
              label={showContactForm ? "Cancel" : "Add contact"}
            />
          </View>
        )}

        {editing && showContactForm && (
          <View style={[components.mtMd, { padding: spacing.md, backgroundColor: colors.background, borderRadius: radius.sm }]}>
            <Text style={layout.subtitle}>Add safety contact</Text>

            <Text style={forms.label}>Name</Text>
            <TextInput value={contactName} onChangeText={setContactName} style={forms.input} placeholder="Contact name" />
            <View style={components.spacerSm} />

            <Text style={forms.label}>Phone</Text>
            <TextInput value={contactPhone} onChangeText={setContactPhone} keyboardType="phone-pad" style={forms.input} placeholder="+351 xxx xxx xxx" />

            <View style={components.mtMd}>
              <Button onPress={addContact} label="Save contact" />
            </View>
          </View>
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


      {/* FRIENDS */}
      {(() => {
        const pendingRequests = getPendingReceivedRequests();
        const friendIds = getAcceptedFriendIds();

        return (
          <View style={components.card}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm }}>
              <Text style={layout.subtitle}>Friends</Text>
              <Pressable
                onPress={() => router.push("/findFriends")}
                style={({ pressed }) => ({
                  backgroundColor: colors.primary,
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  borderRadius: 8,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}>🔍 Find Friends</Text>
              </Pressable>
            </View>

            {pendingRequests.length > 0 && (
              <View style={{ marginBottom: spacing.md }}>
                <Text style={{ color: colors.textLight, fontSize: 13, marginBottom: spacing.sm }}>
                  Pending requests
                </Text>
                {pendingRequests.map(req => {
                  const sender = getUserById(req.senderId);
                  return (
                    <View
                      key={req.id}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: spacing.sm,
                      }}
                    >
                      <Pressable onPress={() => router.push(`/user/${req.senderId}`)}>
                        <Text style={layout.link}>
                          {sender?.name ?? "Unknown"}
                        </Text>
                      </Pressable>
                      <View style={{ flexDirection: "row", gap: spacing.sm }}>
                        <Pressable
                          onPress={() => void acceptFriendRequest(req.id)}
                          style={({ pressed }) => ({
                            backgroundColor: colors.primary,
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 6,
                            opacity: pressed ? 0.7 : 1,
                          })}
                        >
                          <Text style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}>Accept</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => void removeFriend(req.senderId)}
                          style={({ pressed }) => ({
                            borderWidth: 1,
                            borderColor: colors.border,
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 6,
                            opacity: pressed ? 0.7 : 1,
                          })}
                        >
                          <Text style={{ color: colors.textLight, fontSize: 13 }}>Decline</Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {friendIds.length === 0 && pendingRequests.length === 0 && (
              <Text style={{ color: colors.textLight }}>No friends yet</Text>
            )}

            {[...friendIds]
              .sort((a, b) => {
                const nameA = getUserById(a)?.name ?? a;
                const nameB = getUserById(b)?.name ?? b;
                return nameA.localeCompare(nameB);
              })
              .map(friendId => {
              const friend = getUserById(friendId);
              return (
                <Pressable
                  key={friendId}
                  onPress={() => router.push(`/user/${friendId}`)}
                  style={({ pressed }) => ({
                    flexDirection: "row" as const,
                    alignItems: "center" as const,
                    justifyContent: "space-between" as const,
                    marginBottom: spacing.sm,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Text style={layout.link}>
                    {friend?.name ?? friendId}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        );
      })()}

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

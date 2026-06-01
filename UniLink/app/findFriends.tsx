import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { useAuth } from "../hooks/useAuth";
import { useFriends } from "../hooks/useFriends";
import {
  acceptFriendRequest,
  removeFriend,
} from "../services/FriendService";

import { forms } from "../styles/forms";
import { layout } from "../styles/layout";
import { colors, radius, spacing } from "../styles/theme";
import { components } from "../styles/components";

export default function FindFriends() {
  const router = useRouter();
  const { user: me, getUserById, getUsers } = useAuth();
  const { getFriendshipStatus, getPendingReceivedRequests } = useFriends();
  const [query, setQuery] = useState("");

  const pending = getPendingReceivedRequests();

  const results = query.trim().length < 2
    ? []
    : getUsers().filter(u =>
        u.uid !== me?.uid &&
        u.name.toLowerCase().includes(query.trim().toLowerCase())
      );

  return (
    <SafeAreaView style={layout.screen}>
      <Text
        style={{ color: colors.primary, fontWeight: "600", marginBottom: spacing.sm }}
        onPress={() => router.back()}
      >
        ← Back
      </Text>

      <Text style={layout.title}>Find Friends</Text>

      <TextInput
        placeholder="Search by name..."
        placeholderTextColor={colors.textLight}
        value={query}
        onChangeText={setQuery}
        style={forms.input}
        autoFocus
        testID="findFriendsSearchInput"
      />

      <ScrollView
        style={{ flex: 1, marginTop: spacing.md }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* SEARCH RESULTS */}
        {query.trim().length >= 2 && results.length === 0 && (
          <Text style={{ color: colors.textLight, marginBottom: spacing.md }}>
            No users found
          </Text>
        )}

        {results.map(item => {
          const status = getFriendshipStatus(item.uid);
          return (
            <Pressable
              key={item.uid}
              onPress={() => router.push(`/user/${item.uid}`)}
              style={({ pressed }) => [
                components.card,
                {
                  flexDirection: "row" as const,
                  justifyContent: "space-between" as const,
                  alignItems: "center" as const,
                  marginBottom: spacing.sm,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <View>
                <Text style={{ fontWeight: "600", color: colors.text }}>{item.name}</Text>
                <Text style={{ color: colors.textLight, fontSize: 13 }}>{item.university}</Text>
              </View>

              {status === "friends" && (
                <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "600" }}>Friends</Text>
              )}
              {status === "pending_sent" && (
                <Text style={{ color: colors.textLight, fontSize: 13 }}>Pending</Text>
              )}
              {status === "pending_received" && (
                <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "600" }}>Accept?</Text>
              )}
            </Pressable>
          );
        })}

        {/* PENDING REQUESTS */}
        {pending.length > 0 && (
          <View style={{ marginTop: results.length > 0 ? spacing.lg : 0 }}>

            <View style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.sm,
              marginBottom: spacing.md,
            }}>
              <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text }}>
                Pending Requests
              </Text>
              <View style={{
                backgroundColor: colors.primary,
                borderRadius: 10,
                minWidth: 20,
                paddingHorizontal: 7,
                paddingVertical: 2,
                alignItems: "center",
              }}>
                <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>
                  {pending.length}
                </Text>
              </View>
            </View>

            {pending.map(req => {
              const sender = getUserById(req.senderId);
              return (
                <View
                  key={req.id}
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: radius.md,
                    padding: spacing.md,
                    marginBottom: spacing.sm,
                    borderLeftWidth: 3,
                    borderLeftColor: colors.primary,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    shadowColor: "#000",
                    shadowOpacity: 0.04,
                    shadowRadius: 4,
                    elevation: 1,
                  }}
                >
                  <Pressable
                    onPress={() => router.push(`/user/${req.senderId}`)}
                    style={{ flex: 1, marginRight: spacing.sm }}
                  >
                    <Text style={{ fontWeight: "600", color: colors.text, fontSize: 15 }}>
                      {sender?.name ?? "Unknown"}
                    </Text>
                    {sender?.university ? (
                      <Text style={{ color: colors.textLight, fontSize: 12, marginTop: 2 }}>
                        {sender.university}
                      </Text>
                    ) : null}
                  </Pressable>

                  <View style={{ flexDirection: "row", gap: spacing.sm }}>
                    <Pressable
                      onPress={() => void acceptFriendRequest(req.id)}
                      style={({ pressed }) => ({
                        backgroundColor: colors.primary,
                        paddingHorizontal: 14,
                        paddingVertical: 7,
                        borderRadius: radius.sm,
                        opacity: pressed ? 0.7 : 1,
                      })}
                    >
                      <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>
                        Accept
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => void removeFriend(req.senderId)}
                      style={({ pressed }) => ({
                        borderWidth: 1,
                        borderColor: colors.border,
                        paddingHorizontal: 14,
                        paddingVertical: 7,
                        borderRadius: radius.sm,
                        opacity: pressed ? 0.7 : 1,
                      })}
                    >
                      <Text style={{ color: colors.textLight, fontSize: 13 }}>
                        Decline
                      </Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}

          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

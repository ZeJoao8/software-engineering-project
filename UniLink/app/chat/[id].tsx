import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import { getRides } from "../../data/rides";
import { getCurrentUser, getUserById } from "../../data/user";
import { subscribeToRideChat, sendMessage, type Message } from "../../data/chat";

import { colors, spacing, radius } from "../../styles/theme";

export default function RideChat() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = typeof params.id === "string" ? params.id : "";

  const ride = getRides().find(r => r.id === id);
  const activeUser = getCurrentUser();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!ride || !activeUser) return;

    const joined = ride.passengers.includes(activeUser.uid);
    const isDriver = ride.driverId === activeUser.uid;

    if (!joined && !isDriver) {
      router.replace("/(tabs)/myRides");
      return;
    }

    const unsub = subscribeToRideChat(ride.id, (msgs) => setMessages(msgs));
    return () => {
      if (unsub) unsub();
    };
  }, [ride?.id, activeUser?.uid]);

  if (!ride || !activeUser) return null;

  async function handleSend() {
    if (!ride || !activeUser) return;
    const text = inputText.trim();
    if (!text) return;

    setInputText("");

    const newMessage: Message = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      rideId: ride.id,
      senderId: activeUser.uid,
      text,
      createdAt: new Date().toISOString(),
    };

    await sendMessage(newMessage);
  }

  function formatTime(isoString: string) {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const renderMessage = ({ item }: { item: Message }) => {
    if (!ride || !activeUser) return null;
    const isMe = item.senderId === activeUser.uid;
    const sender = isMe ? activeUser : getUserById(item.senderId);

    // Check if driver
    const isSenderDriver = item.senderId === ride.driverId;

    return (
      <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.otherMessage]}>
        {!isMe && (
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
            <Text style={styles.senderName}>{sender?.name || "User"}</Text>
            {isSenderDriver && <Text style={styles.driverBadge}> • Driver</Text>}
          </View>
        )}

        <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.otherMessageText]}>
            {item.text}
          </Text>
          <Text style={[styles.timeText, isMe ? styles.myTimeText : styles.otherTimeText]}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={{ padding: spacing.sm }}>
            <Text style={styles.backButton}>← Back</Text>
          </Pressable>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Ride Group Chat</Text>
            <Text style={styles.headerSubtitle}>{ride.origin} → {ride.destination}</Text>
          </View>
          <View style={{ width: 50 }} />
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          inverted
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            multiline
            maxLength={500}
          />
          <Pressable
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={() => void handleSend()}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 16,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  listContent: {
    padding: spacing.md,
  },
  messageContainer: {
    marginBottom: spacing.md,
    maxWidth: "80%",
  },
  myMessage: {
    alignSelf: "flex-end",
  },
  otherMessage: {
    alignSelf: "flex-start",
  },
  senderName: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: "600",
    marginLeft: 4,
  },
  driverBadge: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: "700",
  },
  bubble: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
  },
  myBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: "white",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: "white",
  },
  otherMessageText: {
    color: colors.text,
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  myTimeText: {
    color: "rgba(255,255,255,0.7)",
  },
  otherTimeText: {
    color: colors.textLight,
  },
  inputContainer: {
    flexDirection: "row",
    padding: spacing.md,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingTop: 10,
    paddingBottom: 10,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 15,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    height: 40,
    paddingHorizontal: spacing.md,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: colors.primaryLight,
  },
  sendButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 15,
  },
});

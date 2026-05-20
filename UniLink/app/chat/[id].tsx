import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useAuth } from "../../hooks/useAuth";
import { useRides } from "../../hooks/useRides";
import { useMessages } from "../../hooks/useMessages";
import { sendMessage } from "../../services/ChatService";
import { isUserDriver, isUserPassenger } from "../../domain/rules/rideRules";
import type { Message } from "../../domain/entities/Message";
import { formatTime } from "../../utils/date";
import {
  createNotification,
  getNotifications,
  markNotificationAsRead,
  subscribeToNotificationsChanges,
} from "../../store/notifications";

import { colors, spacing } from "../../styles/theme";
import { chatStyles } from "../../styles/chat";
import { layout } from "../../styles/layout";

export default function RideChat() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = typeof params.id === "string" ? params.id : "";

  const rides = useRides();
  const { user: activeUser, getUserById } = useAuth();

  const ride = rides.find(r => r.id === id);

  const joined = ride ? isUserPassenger(ride, activeUser?.uid ?? "") : false;
  const isDriver = ride ? isUserDriver(ride, activeUser?.uid ?? "") : false;
  const messages = useMessages(joined || isDriver ? ride?.id ?? null : null);

  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!ride || !activeUser) return;
    if (!joined && !isDriver) {
      router.replace("/(tabs)/myRides");
    }
  }, [ride?.id, activeUser?.uid]);

  useEffect(() => {
    if (!ride) return;

    function dismissChatNotifications() {
      const toRead = getNotifications().filter(
        n => n.type === "chat_message" && n.rideId === ride!.id
      );
      for (const n of toRead) {
        void markNotificationAsRead(n.id);
      }
    }

    dismissChatNotifications();
    return subscribeToNotificationsChanges(dismissChatNotifications);
  }, [ride?.id]);

  if (!ride || !activeUser) return null;

  async function handleSend() {
    if (!ride || !activeUser) return;
    const text = inputText.trim();
    if (!text) return;
    setInputText("");

    const result = await sendMessage(ride.id, activeUser.uid, text);
    if (!result.ok) {
      setInputText(text);
      Alert.alert("Error", result.error);
      return;
    }

    const recipients = [ride.driverId, ...ride.passengers].filter(
      uid => uid !== activeUser.uid
    );
    const preview = text.length > 60 ? text.slice(0, 57) + "…" : text;
    for (const uid of recipients) {
      void createNotification({
        userId: uid,
        type: "chat_message",
        title: `${activeUser.name}: ${preview}`,
        body: `${ride.origin} → ${ride.destination}`,
        rideId: ride.id,
        route: `/chat/${ride.id}`,
      });
    }
  }

  const renderMessage = ({ item }: { item: Message }) => {
    if (!ride || !activeUser) return null;
    const isMe = item.senderId === activeUser.uid;
    const sender = isMe ? activeUser : getUserById(item.senderId);
    const isSenderDriver = isUserDriver(ride, item.senderId);

    return (
      <View style={[chatStyles.messageContainer, isMe ? chatStyles.myMessage : chatStyles.otherMessage]}>
        {!isMe && (
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
            <Text style={chatStyles.senderName}>{sender?.name || "User"}</Text>
            {isSenderDriver && <Text style={chatStyles.driverBadge}> • Driver</Text>}
          </View>
        )}

        <View style={[chatStyles.bubble, isMe ? chatStyles.myBubble : chatStyles.otherBubble]}>
          <Text style={[chatStyles.messageText, isMe ? chatStyles.myMessageText : chatStyles.otherMessageText]}>
            {item.text}
          </Text>
          <Text style={[chatStyles.timeText, isMe ? chatStyles.myTimeText : chatStyles.otherTimeText]}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={chatStyles.container}>
      <KeyboardAvoidingView
        style={chatStyles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View style={chatStyles.header}>
          <Pressable onPress={() => router.back()} style={{ padding: spacing.sm }}>
            <Text style={layout.link}>← Back</Text>
          </Pressable>
          <View style={chatStyles.headerTitleContainer}>
            <Text style={chatStyles.headerTitle}>Ride Group Chat</Text>
            <Text style={chatStyles.headerSubtitle}>{ride.origin} → {ride.destination}</Text>
          </View>
          <View style={{ width: 50 }} />
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={chatStyles.listContent}
          inverted
        />

        <View style={chatStyles.inputContainer}>
          <TextInput
            style={chatStyles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={colors.textLight}
            multiline
            maxLength={500}
          />
          <Pressable
            style={[chatStyles.sendButton, !inputText.trim() && chatStyles.sendButtonDisabled]}
            onPress={() => void handleSend()}
            disabled={!inputText.trim()}
          >
            <Text style={chatStyles.sendButtonText}>Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

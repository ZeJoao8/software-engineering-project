import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import { getRides } from "../../data/rides";
import { getCurrentUser, getUserById } from "../../data/user";
import { subscribeToRideChat, sendMessage } from "../../data/chat";
import type { Message } from "../../domain/entities/Message";
import { generateId } from "../../infra/firebase";

import { colors, spacing } from "../../styles/theme";
import { chatStyles } from "../../styles/chat";
import { layout } from "../../styles/layout";

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
      id: generateId("chat_messages"),
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
    const isSenderDriver = item.senderId === ride.driverId;

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

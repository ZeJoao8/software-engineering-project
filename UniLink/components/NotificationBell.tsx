import { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useNotifications } from "../hooks/useNotifications";
import { markNotificationAsRead } from "../store/notifications";
import { type Notification, type NotificationType } from "../domain/entities/Notification";
import { colors } from "../styles/theme";
import { components } from "../styles/components";

const TYPE_ICON: Record<NotificationType, keyof typeof Ionicons.glyphMap> = {
  ride_join:          "person-add-outline",
  ride_cancel:        "person-remove-outline",
  passenger_removed:  "close-circle-outline",
  ride_completed:     "checkmark-circle-outline",
  ride_cancelled:     "close-circle-outline",
  chat_message:       "chatbubble-ellipses-outline",
};

function formatRelativeTime(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "Now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMs / 3_600_000);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffMs / 86_400_000)}d ago`;
}

export function NotificationBell() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const notifications = useNotifications();
  const [panelVisible, setPanelVisible] = useState(false);

  const unreadCount = notifications.length;

  async function handlePress(notification: Notification) {
    await markNotificationAsRead(notification.id);
    setPanelVisible(false);
    router.push(notification.route as Parameters<typeof router.push>[0]);
  }

  return (
    <>
      <Pressable
        onPress={() => setPanelVisible(true)}
        style={({ pressed }) => [components.notifBellButton, { opacity: pressed ? 0.7 : 1 }]}
        accessibilityLabel="Notifications"
      >
        <Ionicons name="notifications-outline" size={24} color={colors.primarySoft} />
        {unreadCount > 0 && (
          <View style={components.notifBadge}>
            <Text style={components.notifBadgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
          </View>
        )}
      </Pressable>

      <Modal
        visible={panelVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPanelVisible(false)}
      >
        <Pressable style={components.notifOverlay} onPress={() => setPanelVisible(false)}>
          <Pressable
            style={[components.notifPanel, { top: insets.top + 58 }]}
            onPress={() => { /* prevent overlay close when tapping panel */ }}
          >
            <View style={components.notifPanelHeader}>
              <Text style={components.notifPanelTitle}>Notifications</Text>
              <Pressable onPress={() => setPanelVisible(false)}>
                <Ionicons name="close" size={20} color={colors.textLight} />
              </Pressable>
            </View>

            {notifications.length === 0 ? (
              <Text style={components.notifEmpty}>No unread notifications</Text>
            ) : (
              <FlatList
                data={notifications}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <Pressable
                    style={({ pressed }) => [
                      components.notifItem,
                      pressed && components.notifItemPressed,
                    ]}
                    onPress={() => void handlePress(item)}
                  >
                    <View style={components.notifItemIcon}>
                      <Ionicons
                        name={TYPE_ICON[item.type]}
                        size={18}
                        color={colors.primary}
                      />
                    </View>
                    <View style={components.notifItemContent}>
                      <Text style={components.notifItemTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={components.notifItemBody} numberOfLines={2}>
                        {item.body}
                      </Text>
                      <Text style={components.notifItemTime}>
                        {formatRelativeTime(item.createdAt)}
                      </Text>
                    </View>
                  </Pressable>
                )}
                ItemSeparatorComponent={() => <View style={components.notifSeparator} />}
                showsVerticalScrollIndicator={false}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

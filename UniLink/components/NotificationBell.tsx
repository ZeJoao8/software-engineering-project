import { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import {
  getNotifications,
  markNotificationAsRead,
  subscribeToNotificationsChanges,
} from "../store/notifications";
import { type Notification, type NotificationType } from "../domain/entities/Notification";
import { colors, radius, spacing } from "../styles/theme";

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
  if (diffMin < 1) return "Agora";
  if (diffMin < 60) return `Há ${diffMin} min`;
  const diffHours = Math.floor(diffMs / 3_600_000);
  if (diffHours < 24) return `Há ${diffHours}h`;
  return `Há ${Math.floor(diffMs / 86_400_000)}d`;
}

export function NotificationBell() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<Notification[]>(
    getNotifications()
  );
  const [panelVisible, setPanelVisible] = useState(false);

  useEffect(() => {
    return subscribeToNotificationsChanges(() => {
      setNotifications([...getNotifications()]);
    });
  }, []);

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
        style={({ pressed }) => [styles.bellButton, { opacity: pressed ? 0.7 : 1 }]}
        accessibilityLabel="Notificações"
      >
        <Ionicons name="notifications-outline" size={24} color={colors.primarySoft} />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
          </View>
        )}
      </Pressable>

      <Modal
        visible={panelVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPanelVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setPanelVisible(false)}>
          <Pressable
            style={[styles.panel, { top: insets.top + 58 }]}
            onPress={() => { /* prevent overlay close when tapping panel */ }}
          >
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>Notificações</Text>
              <Pressable onPress={() => setPanelVisible(false)}>
                <Ionicons name="close" size={20} color={colors.textLight} />
              </Pressable>
            </View>

            {notifications.length === 0 ? (
              <Text style={styles.empty}>Sem notificações por ler</Text>
            ) : (
              <FlatList
                data={notifications}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <Pressable
                    style={({ pressed }) => [
                      styles.item,
                      pressed && styles.itemPressed,
                    ]}
                    onPress={() => void handlePress(item)}
                  >
                    <View style={styles.itemIcon}>
                      <Ionicons
                        name={TYPE_ICON[item.type]}
                        size={18}
                        color={colors.primary}
                      />
                    </View>
                    <View style={styles.itemContent}>
                      <Text style={styles.itemTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.itemBody} numberOfLines={2}>
                        {item.body}
                      </Text>
                      <Text style={styles.itemTime}>
                        {formatRelativeTime(item.createdAt)}
                      </Text>
                    </View>
                  </Pressable>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                showsVerticalScrollIndicator={false}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bellButton: {
    marginLeft: 14,
    padding: 4,
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: colors.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 14,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  panel: {
    position: "absolute",
    left: 8,
    width: 310,
    maxHeight: 400,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    overflow: "hidden",
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  panelTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  empty: {
    padding: spacing.md,
    color: colors.textLight,
    fontSize: 14,
    textAlign: "center",
  },
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    gap: spacing.sm,
  },
  itemPressed: {
    backgroundColor: colors.background,
  },
  itemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  itemContent: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  itemBody: {
    fontSize: 12,
    color: colors.textLight,
    lineHeight: 17,
  },
  itemTime: {
    fontSize: 11,
    color: colors.textFaint,
    marginTop: 1,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.md + 32 + spacing.sm,
  },
});

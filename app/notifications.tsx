import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NoActiveAlert from "@/components/cards/noActiveAlerts";
import NoNotification from "@/components/cards/noNotifications";
import { useAuth } from "@/context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StatusBar, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNotifications } from "../context/notificationContext";
import { useTasks } from "../context/tasksContext";
import { computeComputedTaskStatus, parseLocalDueDateTime } from "../utils/taskDueDate";
import { getResponsiveTokens } from "../utils/responsive";

type NotificationType = "alert" | "task" | "system";

type NotificationItem = {
  id: string;
  notificationId?: number;
  ephemeralId?: string;
  userId?: number;
  title: string;
  message: string;
  createdAt: string;
  unread: boolean;
  type: NotificationType;
  source: "api" | "ephemeral" | "derived";
};

const formatRelativeTime = (iso: string) => {
  const value = new Date(iso);
  if (Number.isNaN(value.getTime())) {
    return "Just now";
  }

  const elapsedMs = Date.now() - value.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (elapsedMs < hour) {
    const mins = Math.max(1, Math.floor(elapsedMs / minute));
    return `${mins}m ago`;
  }
  if (elapsedMs < day) {
    const hrs = Math.max(1, Math.floor(elapsedMs / hour));
    return `${hrs}h ago`;
  }

  const days = Math.max(1, Math.floor(elapsedMs / day));
  return `${days}d ago`;
};

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const tokens = getResponsiveTokens(width);
  const {
    notifications,
    ephemeralNotifications,
    loadingNotifications,
    notificationError,
    listMyNotifications,
    deleteAllMyNotifications,
    markNotificationAsRead,
    markEphemeralNotificationAsRead,
  } = useNotifications();
  const { tasks } = useTasks();
  const [nowMs, setNowMs] = useState(Date.now());
  const [readApiIds, setReadApiIds] = useState<number[]>([]);
  const [readDerivedIds, setReadDerivedIds] = useState<string[]>([]);
  const [clearedAtIso, setClearedAtIso] = useState<string | null>(null);

  const derivedReadStorageKey = useMemo(() => {
    const userKey = user?.username || "anonymous";
    return `notifications:derived-read:${userKey}`;
  }, [user?.username]);

  const apiReadStorageKey = useMemo(() => {
    const userKey = user?.username || "anonymous";
    return `notifications:api-read:${userKey}`;
  }, [user?.username]);

  StatusBar.setBarStyle("dark-content");

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let mounted = true;

    AsyncStorage.getItem(derivedReadStorageKey)
      .then((value) => {
        if (!mounted) return;

        if (!value) {
          setReadDerivedIds([]);
          return;
        }

        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          setReadDerivedIds(parsed.filter((id): id is string => typeof id === "string" && id.length > 0));
          return;
        }

        setReadDerivedIds([]);
      })
      .catch(() => {
        if (mounted) {
          setReadDerivedIds([]);
        }
      });

    return () => {
      mounted = false;
    };
  }, [derivedReadStorageKey]);

  useEffect(() => {
    let mounted = true;

    AsyncStorage.getItem(apiReadStorageKey)
      .then((value) => {
        if (!mounted) return;

        if (!value) {
          setReadApiIds([]);
          return;
        }

        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          setReadApiIds(
            parsed
              .map((id) => Number(id))
              .filter((id): id is number => Number.isInteger(id) && id > 0),
          );
          return;
        }

        setReadApiIds([]);
      })
      .catch(() => {
        if (mounted) {
          setReadApiIds([]);
        }
      });

    return () => {
      mounted = false;
    };
  }, [apiReadStorageKey]);

  useEffect(() => {
    AsyncStorage.setItem(derivedReadStorageKey, JSON.stringify(readDerivedIds)).catch(() => {
      // Do not block notification UX if local persistence fails.
    });
  }, [derivedReadStorageKey, readDerivedIds]);

  useEffect(() => {
    AsyncStorage.setItem(apiReadStorageKey, JSON.stringify(readApiIds)).catch(() => {
      // Do not block notification UX if local persistence fails.
    });
  }, [apiReadStorageKey, readApiIds]);

  const apiItems = useMemo<NotificationItem[]>(() => {
    return notifications.map((item) => {
      const normalizedText = `${item.title} ${item.message}`.toLowerCase();
      const type: NotificationType = normalizedText.includes("alert") || normalizedText.includes("missing") || normalizedText.includes("overdue")
        ? "alert"
        : normalizedText.includes("task") || normalizedText.includes("completed")
          ? "task"
          : "system";

      return {
        id: `notification-${item.notification_id}`,
        notificationId: item.notification_id,
        userId: item.user_id,
        title: item.title,
        message: item.message,
        createdAt: item.created_at,
        unread: !item.read && !readApiIds.includes(item.notification_id),
        type,
        source: "api",
      };
    });
  }, [notifications, readApiIds]);

  const ephemeralItems = useMemo<NotificationItem[]>(() => {
    return ephemeralNotifications.map((item) => {
      const normalizedText = `${item.title} ${item.message}`.toLowerCase();
      const type: NotificationType = normalizedText.includes("alert") || normalizedText.includes("missing") || normalizedText.includes("overdue")
        ? "alert"
        : normalizedText.includes("task") || normalizedText.includes("completed")
          ? "task"
          : "system";

      return {
        id: item.id,
        ephemeralId: item.id,
        title: item.title,
        message: item.message,
        createdAt: item.created_at,
        unread: !item.read,
        type,
        source: "ephemeral",
      };
    });
  }, [ephemeralNotifications]);

  const missingTaskItems = useMemo<NotificationItem[]>(() => {
    const existingAlertText = new Set(
      [...apiItems, ...ephemeralItems]
        .filter((item) => item.type === "alert")
        .map((item) => `${item.title.toLowerCase()}|${item.message.toLowerCase()}`),
    );

    return tasks
      .map((task) => {
        const due = parseLocalDueDateTime(task.dueDate, task.dueTime);
        const computedStatus = computeComputedTaskStatus(task.status, due, nowMs);
        if (computedStatus !== "missing") {
          return null;
        }

        const title = "Task overdue";
        const message = `${task.title} is now marked as missing.`;
        const signature = `${title.toLowerCase()}|${message.toLowerCase()}`;
        if (existingAlertText.has(signature)) {
          return null;
        }

        const derivedId = `derived-missing-${task.id}`;

        return {
          id: derivedId,
          title,
          message,
          createdAt: due ? due.toISOString() : new Date(nowMs).toISOString(),
          unread: !readDerivedIds.includes(derivedId),
          type: "alert" as NotificationType,
          source: "derived" as const,
        };
      })
      .filter((item): item is NotificationItem => !!item)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [tasks, nowMs, apiItems, ephemeralItems, readDerivedIds]);

  const items = useMemo(() => {
    const combined = [...ephemeralItems, ...apiItems, ...missingTaskItems].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    if (!clearedAtIso) {
      return combined;
    }

    const clearedMs = new Date(clearedAtIso).getTime();
    if (Number.isNaN(clearedMs)) {
      return combined;
    }

    return combined.filter((item) => {
      const createdMs = new Date(item.createdAt).getTime();
      if (Number.isNaN(createdMs)) {
        return true;
      }

      return createdMs > clearedMs;
    });
  }, [ephemeralItems, apiItems, missingTaskItems, clearedAtIso]);

  const alerts = useMemo(() => items.filter((item) => item.type === "alert"), [items]);
  const others = useMemo(() => items.filter((item) => item.type !== "alert"), [items]);
  const unreadCount = useMemo(() => items.filter((item) => item.unread).length, [items]);

  useEffect(() => {
    listMyNotifications().catch(() => {
      // Keep UI visible even if fetch fails.
    });
  }, [listMyNotifications]);

  const markAllRead = async () => {
    const unreadApiIds = items
      .filter((item) => item.unread)
      .map((item) => item.notificationId)
      .filter((value): value is number => typeof value === "number");

    const unreadEphemeralIds = items
      .filter((item) => item.unread)
      .map((item) => item.ephemeralId)
      .filter((value): value is string => typeof value === "string" && value.length > 0);

    const unreadDerivedIds = items
      .filter((item) => item.unread && item.source === "derived")
      .map((item) => item.id);

    if (unreadApiIds.length === 0 && unreadEphemeralIds.length === 0 && unreadDerivedIds.length === 0) {
      return;
    }

    await Promise.all(unreadApiIds.map((notificationId) => markNotificationAsRead(notificationId).catch(() => null)));
    if (unreadApiIds.length > 0) {
      setReadApiIds((prev) => [...new Set([...prev, ...unreadApiIds])]);
    }
    unreadEphemeralIds.forEach((id) => markEphemeralNotificationAsRead(id));
    if (unreadDerivedIds.length > 0) {
      setReadDerivedIds((prev) => [...new Set([...prev, ...unreadDerivedIds])]);
    }
    await listMyNotifications().catch(() => null);
  };

  const handleDeleteAll = () => {
    if (items.length === 0) {
      return;
    }

    Alert.alert("Delete all notifications", "This will clear all notifications from this screen.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete all",
        style: "destructive",
        onPress: async () => {
          await deleteAllMyNotifications().catch(() => null);

          // Hide currently visible local/derived entries; new items still appear later.
          setClearedAtIso(new Date().toISOString());
          setReadDerivedIds((prev) => {
            const derivedIds = items.filter((item) => item.source === "derived").map((item) => item.id);
            return [...new Set([...prev, ...derivedIds])];
          });

          items
            .filter((item) => item.source === "ephemeral" && typeof item.ephemeralId === "string")
            .forEach((item) => {
              if (item.ephemeralId) {
                markEphemeralNotificationAsRead(item.ephemeralId);
              }
            });

          await listMyNotifications().catch(() => null);
        },
      },
    ]);
  };

  const renderCard = (item: NotificationItem) => {
    const iconName =
      item.type === "alert"
        ? "warning-amber"
        : item.type === "task"
          ? "check-circle-outline"
          : "notifications-none";

    const iconColor = item.type === "alert" ? "#D97706" : "#7C6FDC";

    return (
      <Pressable
        key={item.id}
        onPress={() => {
          if (!item.unread) {
            if (item.type === "alert") {
              router.push({
                pathname: "/(tabs)/tasks",
                params: {
                  fromNotification: "1",
                  notificationId: item.id,
                  notificationType: item.type,
                  notificationTitle: item.title,
                  notificationMessage: item.message,
                  notificationCreatedAt: item.createdAt,
                },
              });
            }
            return;
          }

          if (typeof item.notificationId === "number") {
            markNotificationAsRead(item.notificationId).catch(() => null);
            setReadApiIds((prev) => (prev.includes(item.notificationId) ? prev : [...prev, item.notificationId]));
          }

          if (typeof item.ephemeralId === "string") {
            markEphemeralNotificationAsRead(item.ephemeralId);
          }

          if (item.source === "derived") {
            setReadDerivedIds((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]));
          }

          if (item.type === "alert") {
            router.push({
              pathname: "/(tabs)/tasks",
              params: {
                fromNotification: "1",
                notificationId: item.id,
                notificationType: item.type,
                notificationTitle: item.title,
                notificationMessage: item.message,
                notificationCreatedAt: item.createdAt,
              },
            });
          }
        }}
      >
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <MaterialIcons name={iconName} size={20} color={iconColor} />
        </View>
        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { fontSize: tokens.body }]}>{item.title}</Text>
            <Text style={[styles.cardTime, { fontSize: tokens.bodySmall }]}>{formatRelativeTime(item.createdAt)}</Text>
          </View>
          <Text style={[styles.cardMessage, { fontSize: tokens.bodySmall }]}>{item.message}</Text>
        </View>
        {item.unread ? <View style={styles.unreadDot} /> : null}
      </View>
      </Pressable>
    );
  };

  return (
    <LinearGradient colors={["#E3F2FD", "#F3E5F8", "#E8E4F8"]} style={styles.gradient}>
      <SafeAreaView style={[styles.container, { maxWidth: tokens.containerMaxWidth, alignSelf: "center", width: "100%", padding: tokens.pagePadding }]}>
        <View style={styles.headerRow}>
          <Pressable hitSlop={12} onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color="#000" />
          </Pressable>
          <View style={styles.headerTextWrap}>
            <Text style={[styles.title, { fontSize: tokens.title }]}>Notifications</Text>
            <Text style={[styles.subtitle, { fontSize: tokens.subtitle }]}>Alerts and updates in one place</Text>
          </View>
          <Pressable hitSlop={10} onPress={handleDeleteAll} disabled={items.length === 0}>
            <Text style={[styles.deleteAllText, items.length === 0 && styles.actionDisabled, { fontSize: tokens.menuText }]}>Delete all</Text>
          </Pressable>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryTextWrap}>
            <Text style={[styles.summaryText, { fontSize: tokens.body }]}>{unreadCount} unread notification{unreadCount === 1 ? "" : "s"}</Text>
          </View>

          <View style={styles.summaryActions}>
            <Pressable onPress={() => { markAllRead().catch(() => null); }}>
              <Text style={[styles.markReadText, { fontSize: tokens.menuText }]}>Mark all as read</Text>
            </Pressable>
          </View>
        </View>

        {loadingNotifications ? <Text style={styles.loadingText}>Loading notifications...</Text> : null}
        {notificationError && items.length === 0 ? <Text style={styles.errorText}>{notificationError}</Text> : null}

        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          <Text style={[styles.sectionTitle, { fontSize: tokens.subtitle }]}>Alerts</Text>
          {alerts.length > 0 ? alerts.map(renderCard) : <NoActiveAlert />}

          <Text style={[styles.sectionTitle, { fontSize: tokens.subtitle }]}>Other notifications</Text>
          {others.length > 0 ? others.map(renderCard) : <NoNotification />}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 0,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 6,
  },
  headerTextWrap: {
    flex: 1,
  },
  title: {
    fontWeight: "bold",
    marginTop: 12,
    color: "#111",
  },
  subtitle: {
    color: "#666",
    marginTop: 4,
  },
  summaryCard: {
    marginTop: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  summaryTextWrap: {
    flex: 1,
    gap: 2,
  },
  summaryActions: {
    alignItems: "flex-end",
  },
  summaryText: {
    color: "#374151",
    fontWeight: "600",
  },
  markReadText: {
    color: "#7C6FDC",
    fontWeight: "700",
  },
  deleteAllText: {
    color: "#B91C1C",
    fontWeight: "700",
    marginTop: 12,
  },
  actionDisabled: {
    opacity: 0.45,
  },
  loadingText: {
    marginTop: 10,
    color: "#4B5563",
  },
  errorText: {
    marginTop: 8,
    color: "#B91C1C",
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 28,
    gap: 10,
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 2,
    color: "#111",
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: {
    flex: 1,
    gap: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  cardTitle: {
    flex: 1,
    color: "#111827",
    fontWeight: "700",
  },
  cardTime: {
    color: "#6B7280",
  },
  cardMessage: {
    color: "#4B5563",
  },
  unreadDot: {
    marginTop: 4,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#7C6FDC",
  },
});
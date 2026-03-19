import { Stack, usePathname, useRootNavigationState, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MD3LightTheme, PaperProvider } from "react-native-paper";
import ReminderModal from "../components/modals/reminderModal";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { ChatbotProvider } from "../context/ChatbotContext";
import { DependentProvider } from "../context/DependentContext";
import { TasksProvider, useTasks } from "../context/TasksContext";
import { UserProvider } from "../context/UserContext";

function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();
  const rootState = useRootNavigationState();
  const { user, authChecking } = useAuth();

  useEffect(() => {
    if (!rootState?.key) return; // navigation not ready
    if (authChecking) return;

    const currentSegment = segments[0];
    const onAuthScreens = pathname === "/login" || pathname === "/signup" || currentSegment === "login" || currentSegment === "signup";

    if (!user && !onAuthScreens) {
      // defer to next tick to avoid pre-mount navigation warning
      setTimeout(() => router.replace("/login"), 0);
    }

    if (user && onAuthScreens) {
      setTimeout(() => router.replace("/"), 0);
    }
  }, [user, authChecking, pathname, router, rootState?.key, segments]);

  if (authChecking || !rootState?.key) {
    return (
      <View style={styles.guardLoadingContainer}>
        <ActivityIndicator size="large" color="#7C6FDC" />
      </View>
    );
  }

  return <>{children}</>;
}


export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <UserProvider>
          <ChatbotProvider>
            <DependentProvider>
              <TasksProvider>
                <PaperProvider theme={MD3LightTheme}>
                  <ReminderMounts />
                  <RouteGuard>
                    <Stack>
                      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                      <Stack.Screen name="login" options={{ headerShown: false }} />
                      <Stack.Screen name="signup" options={{ headerShown: false }} />
                      <Stack.Screen name="addTaskPage" options={{ headerShown: false }} />
                      <Stack.Screen name="editTaskPage" options={{ headerShown: false }} />
                      <Stack.Screen name="taskDetails" options={{ headerShown: false }} />
                      <Stack.Screen name="careSpaceSettings" options={{ headerShown: false }} />
                      <Stack.Screen name="editCareSpaceSettings" options={{ headerShown: false }} />
                      <Stack.Screen name="aiChat" options={{ headerShown: false }} />
                      <Stack.Screen name="dependentProfile" options={{ headerShown: false }} />
                      <Stack.Screen name="profileAndAccount" options={{ headerShown: false }} />
                      <Stack.Screen name="editProfile" options={{ headerShown: false }} />
                      <Stack.Screen name="settings" options={{ headerShown: false }} />
                      <Stack.Screen name="addDependent" options={{ headerShown: false }} />
                      <Stack.Screen name="editDependent" options={{ headerShown: false }} />
                    </Stack>
                  </RouteGuard>
                </PaperProvider>
              </TasksProvider>
            </DependentProvider>
          </ChatbotProvider>
        </UserProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

function ReminderMounts() {
  const { tasks } = useTasks();

  const parseDate = (value?: string) => {
    if (!value) return null;
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const parseTime = (value?: string) => {
    if (!value) return null;
    const match = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?/);
    if (!match) return null;
    let hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);
    const meridiem = match[3]?.toUpperCase();
    if (meridiem === "PM" && hour !== 12) hour += 12;
    if (meridiem === "AM" && hour === 12) hour = 0;
    const time = new Date();
    time.setHours(hour, minute, 0, 0);
    return time;
  };

  return (
    <>
      {tasks.map((task) => {
        if (!task.reminderEnabled || !task.dueDate || !task.dueTime) return null;
        const datePart = parseDate(task.dueDate);
        const timePart = parseTime(task.dueTime);
        if (!datePart || !timePart) return null;
        return (
          <ReminderModal
            key={task.id}
            dueDate={datePart}
            dueTime={timePart}
            title="Task Reminder"
            message={`${task.title || "Task"} is due now.`}
            onClose={() => {}}
            checkIntervalMs={1000}
          />
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  guardLoadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E3F2FD",
  },
});

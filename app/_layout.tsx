import { LinearGradient } from "expo-linear-gradient";
import { Stack, useGlobalSearchParams, usePathname, useRootNavigationState, useRouter, useSegments } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Easing, Image, PanResponder, TextInput as RNTextInput, StatusBar, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MD3LightTheme, PaperProvider } from "react-native-paper";
import ReminderModal from "../components/modals/reminderModal";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { CareSpacesProvider } from "../context/CareSpacesContext";
import { ChatbotProvider } from "../context/ChatbotContext";
import { DashboardProvider } from "../context/dashboardContext";
import { DependentProvider } from "../context/DependentContext";
import { TasksProvider, useTasks } from "../context/tasksContext";
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
  const [showIntroSplash, setShowIntroSplash] = useState(true);

  useEffect(() => {
    const textCtor = Text as any;
    textCtor.defaultProps = textCtor.defaultProps ?? {};
    textCtor.defaultProps.allowFontScaling = false;
    textCtor.defaultProps.maxFontSizeMultiplier = 1;

    const inputCtor = RNTextInput as any;
    inputCtor.defaultProps = inputCtor.defaultProps ?? {};
    inputCtor.defaultProps.allowFontScaling = false;
    inputCtor.defaultProps.maxFontSizeMultiplier = 1;
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntroSplash(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (showIntroSplash) {
    return <BrandSplashScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <UserProvider>
          <ChatbotProvider>
            <DependentProvider>
              <DashboardProvider>
              <TasksProvider>
                <CareSpacesProvider>
                  <PaperProvider theme={MD3LightTheme}>
                    <GlobalPullToRefresh>
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
                          <Stack.Screen name="dependentAccount" options={{ headerShown: false }} />
                          <Stack.Screen name="emergencyAlertPage" options={{ headerShown: false }} />
                        </Stack>
                      </RouteGuard>
                    </GlobalPullToRefresh>
                  </PaperProvider>
                </CareSpacesProvider>
              </TasksProvider>
              </DashboardProvider>
            </DependentProvider>
          </ChatbotProvider>
        </UserProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

function GlobalPullToRefresh({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useGlobalSearchParams();
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pullDistance = useRef(new Animated.Value(0)).current;
  const refreshStartedRef = useRef(false);
  const activePullRef = useRef(false);

  const MAX_PULL_DISTANCE = 140;
  const REFRESH_TRIGGER_DISTANCE = 90;

  const buildRefreshPath = () => {
    const nextQuery = new URLSearchParams();

    Object.entries(searchParams).forEach(([key, value]) => {
      if (key === "refreshTs") return;
      if (key === "screen" || key === "params" || key === "state" || key === "initial") return;

      if (Array.isArray(value)) {
        value.forEach((entry) => {
          if (entry != null) nextQuery.append(key, String(entry));
        });
        return;
      }

      if (value != null) {
        nextQuery.append(key, String(value));
      }
    });

    nextQuery.set("refreshTs", Date.now().toString());
    const queryString = nextQuery.toString();
    return queryString ? `${pathname}?${queryString}` : `${pathname}?refreshTs=${Date.now()}`;
  };

  const resetPosition = () => {
    setIsPulling(false);
    Animated.timing(pullDistance, {
      toValue: 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  };

  const triggerRefresh = () => {
    if (refreshStartedRef.current) return;
    refreshStartedRef.current = true;
    setIsPulling(false);
    setIsRefreshing(true);

    try {
      Animated.timing(pullDistance, {
        toValue: 72,
        duration: 120,
        useNativeDriver: false,
      }).start();

      router.replace(buildRefreshPath() as any);

      setTimeout(() => {
        setIsRefreshing(false);
        refreshStartedRef.current = false;
        resetPosition();
      }, 220);
    } catch {
      setIsRefreshing(false);
      refreshStartedRef.current = false;
      resetPosition();
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        if (isRefreshing) return false;
        const fromTopEdge = gestureState.y0 <= 100;
        const isDownPull = gestureState.dy > 8;
        const mostlyVertical = Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
        return fromTopEdge && isDownPull && mostlyVertical;
      },
      onPanResponderGrant: () => {
        if (isRefreshing) return;
        activePullRef.current = true;
        refreshStartedRef.current = false;
      },
      onPanResponderMove: (_, gestureState) => {
        if (!activePullRef.current || isRefreshing || refreshStartedRef.current) return;

        if (gestureState.dy <= 0) {
          setIsPulling(false);
          pullDistance.setValue(0);
          return;
        }

        const nextDistance = Math.min(gestureState.dy * 0.55, MAX_PULL_DISTANCE);
        setIsPulling(nextDistance > 8);
        pullDistance.setValue(nextDistance);
      },
      onPanResponderRelease: (_, gestureState) => {
        activePullRef.current = false;

        if (!isRefreshing && !refreshStartedRef.current) {
          const releasedDistance = Math.min(Math.max(gestureState.dy * 0.55, 0), MAX_PULL_DISTANCE);
          if (releasedDistance >= REFRESH_TRIGGER_DISTANCE) {
            triggerRefresh();
          } else {
            resetPosition();
          }
        }
      },
      onPanResponderTerminate: () => {
        activePullRef.current = false;
        if (!isRefreshing && !refreshStartedRef.current) {
          resetPosition();
        }
      },
    })
  ).current;

  const spinnerOpacity = pullDistance.interpolate({
    inputRange: [0, 20, 55],
    outputRange: [0, 0.45, 1],
    extrapolate: "clamp",
  });

  const spinnerTranslateY = pullDistance.interpolate({
    inputRange: [0, MAX_PULL_DISTANCE],
    outputRange: [-18, 12],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.pullRoot} {...panResponder.panHandlers}>
      <Animated.View pointerEvents="none" style={[styles.pullReveal, { height: pullDistance }]}> 
        <LinearGradient colors={["#E5F1FF", "#EEE8F8"]} style={styles.pullRevealGradient}>
          <Animated.View
            style={[
              styles.pullSpinnerWrap,
              {
                opacity: isRefreshing ? 1 : spinnerOpacity,
                transform: [{ translateY: spinnerTranslateY }],
              },
            ]}
          >
            {(isPulling || isRefreshing) && <ActivityIndicator size="small" color="#7C6FDC" />}
          </Animated.View>
        </LinearGradient>
      </Animated.View>

      <Animated.View style={[styles.pullContent, { transform: [{ translateY: pullDistance }] }]}>{children}</Animated.View>
    </View>
  );
}

function BrandSplashScreen() {
  const logoScale = useRef(new Animated.Value(0.35)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const brandingOpacity = useRef(new Animated.Value(0)).current;

  StatusBar.setBarStyle("dark-content");

  useEffect(() => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.1,
          duration: 320,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(brandingOpacity, {
        toValue: 1,
        duration: 500,
        delay: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [brandingOpacity, logoOpacity, logoScale]);

  return (
    <LinearGradient colors={["#E8E4F8", "#F3E5F8", "#E3F2FD"]} style={styles.splashGradient}>
      <View style={styles.splashContent}>
        <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}>
          <Image source={require("../assets/images/nurtura_splash.png")} style={styles.splashLogo} resizeMode="contain" />
        </Animated.View>
        <Animated.View style={[styles.splashBranding, { opacity: brandingOpacity }]}>
          <Text style={styles.splashTitle}>Nurtura</Text>
          <Text style={styles.splashTagline}>Care that feels like home</Text>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

function ReminderMounts() {
  const { tasks } = useTasks();

  const parseDate = (value?: string) => {
    if (!value) return null;

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const parsedIso = new Date(`${value}T00:00:00`);
      if (!isNaN(parsedIso.getTime())) return parsedIso;
    }

    if (/^\d{4}\/\d{2}\/\d{2}$/.test(value)) {
      const [year, month, day] = value.split("/").map((part) => parseInt(part, 10));
      const parsedSlash = new Date(year, month - 1, day);
      if (!isNaN(parsedSlash.getTime())) return parsedSlash;
    }

    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) {
      const [month, day, year] = value.split("/").map((part) => parseInt(part, 10));
      const parsedUs = new Date(year, month - 1, day);
      if (!isNaN(parsedUs.getTime())) return parsedUs;
    }

    const parsedNative = new Date(value);
    return isNaN(parsedNative.getTime()) ? null : parsedNative;
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
  pullRoot: {
    flex: 1,
  },
  pullContent: {
    flex: 1,
  },
  pullReveal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
    zIndex: 0,
  },
  pullRevealGradient: {
    flex: 1,
  },
  pullSpinnerWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 14,
  },
  splashGradient: {
    flex: 1,
  },
  splashContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  splashBranding: {
    position: "absolute",
    bottom: 68,
    left: 24,
    right: 24,
    alignItems: "center",
  },
  splashLogo: {
    width: 220,
    height: 220,
  },
  splashTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#2C3350",
    textAlign: "center",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  splashTagline: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#4C566A",
    textAlign: "center",
    letterSpacing: 0.2,
  },
  guardLoadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E3F2FD",
  },
});

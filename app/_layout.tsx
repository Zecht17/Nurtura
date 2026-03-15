import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MD3LightTheme, PaperProvider } from "react-native-paper";
import ReminderModal from "../components/modals/reminderModal";
import { TasksProvider, useTasks } from "../context/TasksContext";

// function RouteGuard ({ children }: { children: React.ReactNode }) {

//   const router = useRouter();
//   const isAuth = false;

//   useEffect(() => {
//     if (!isAuth) {
//       router.replace("/signup");
//     }
//   });

//   return <>{children}</>
  
// }


export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TasksProvider>
        <PaperProvider theme={MD3LightTheme}>
          <ReminderMounts />
          {/* <RouteGuard> */}
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
              <Stack.Screen name="settings" options={{ headerShown: false }} />
            </Stack>
          {/* </RouteGuard> */}
        </PaperProvider>
      </TasksProvider>
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

import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MD3LightTheme, PaperProvider } from "react-native-paper";
import { TasksProvider } from "../context/TasksContext";

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
          {/* <RouteGuard> */}
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="signup" options={{ headerShown: false }} />
              <Stack.Screen name="addTaskPage" options={{ headerShown: false }} />
              <Stack.Screen name="editTaskPage" options={{ headerShown: false }} />
              <Stack.Screen name="taskDetails" options={{ headerShown: false }} />
            </Stack>
          {/* </RouteGuard> */}
        </PaperProvider>
      </TasksProvider>
    </GestureHandlerRootView>
  );
}

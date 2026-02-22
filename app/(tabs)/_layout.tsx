import Feather from '@expo/vector-icons/Feather';
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
      <Tabs screenOptions={{tabBarActiveTintColor: "#7C6FDC"}}>
        <Feather name="home" size={24} color="black" />
        <Tabs.Screen name="index" options={{ headerShown: false , 
          tabBarIcon: ({color}) => (
          <Feather name="home" size={24} color={color} />
          ),
        }} />
        <Feather name="check-circle" size={24} color="black" />
        <Tabs.Screen name="tasks" options={{ headerShown: false,
          tabBarIcon: ({color}) => (
          <Feather name="check-circle" size={24} color={color} />
          ),
        }} />
        <Feather name="calendar" size={24} color="black" />
        <Tabs.Screen name="calendar" options={{ title: "Calendar",
          tabBarIcon: ({color}) => (
          <Feather name="calendar" size={24} color={color} />
          ),
        }} />
        <Feather name="heart" size={24} color="black" />
        <Tabs.Screen name="care" options={{ title: "Care",
          tabBarIcon: ({color}) => (
          <Feather name="heart" size={24} color={color} />
          ),
        }} />
        <Feather name="more-horizontal" size={24} color="black" />
        <Tabs.Screen name="more" options={{ title: "More",
          tabBarIcon: ({color}) => (
          <Feather name="more-horizontal" size={24} color={color} />
          ),
        }} />
      </Tabs>
  );
}
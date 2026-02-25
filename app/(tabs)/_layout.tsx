import Feather from '@expo/vector-icons/Feather';
import Octicons from "@expo/vector-icons/Octicons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
      <Tabs screenOptions={{
        tabBarActiveTintColor: "#7C6FDC",
        tabBarStyle: {
          height: 65,
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
      }}>
        <Tabs.Screen name="index" options={{ 
          title: "Home",
          headerShown: false, 
          tabBarIcon: ({color}) => (
            <Feather name="home" size={24} color={color} />
          ),
        }} />
        <Tabs.Screen name="tasks" options={{ 
          title: "Tasks",
          headerShown: false,
          tabBarIcon: ({color}) => (
            <Feather name="check-circle" size={24} color={color} />
          ),
        }} />
        <Tabs.Screen name="calendar" options={{ 
          headerShown: false, 
          tabBarIcon: ({color}) => (
            <Feather name="calendar" size={24} color={color} />
          ),
        }} />
        <Tabs.Screen name="care" options={{ 
          title: "Care",
          tabBarIcon: ({color}) => (
            <Octicons name="person" size={24} color={color} />
          ),
        }} />
        <Tabs.Screen name="more" options={{ 
          title: "More",
          tabBarIcon: ({color}) => (
            <Feather name="more-horizontal" size={24} color={color} />
          ),
        }} />
      </Tabs>
  );
}
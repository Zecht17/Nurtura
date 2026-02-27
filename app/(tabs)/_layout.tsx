import MoreFeaturesModal from "@/components/modals/MoreFeaturesModal";
import Feather from '@expo/vector-icons/Feather';
import Octicons from "@expo/vector-icons/Octicons";
import { Tabs } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

export default function TabsLayout() {
  const [showMoreModal, setShowMoreModal] = useState(false);
  return (
      <>
      <Tabs screenOptions={{
        tabBarActiveTintColor: "#7C6FDC",
        tabBarInactiveTintColor: "#6b7280",
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
          tabBarButton: (props) => (
            <Pressable
              accessibilityRole={props.accessibilityRole}
              accessibilityState={props.accessibilityState}
              accessibilityLabel={props.accessibilityLabel}
              testID={props.testID}
              onPress={() => setShowMoreModal(true)}
              onLongPress={props.onLongPress}
              style={({ pressed }) => [
                props.style,
                {
                  justifyContent: "center",
                  alignItems: "center",
                  paddingVertical: 4,
                  opacity: pressed ? 0.6 : 1,
                },
              ]}
            >
              <View style={{ alignItems: "center", gap: 2, transform: [{ translateY: -2 }] }}>
                <Feather
                  name="more-horizontal"
                  size={24}
                  color={props?.accessibilityState?.selected ? "#7C6FDC" : "#6b7280"}
                />
                <Text style={{ fontSize: 11, color: props?.accessibilityState?.selected ? "#7C6FDC" : "#6b7280" }}>
                  More
                </Text>
              </View>
            </Pressable>
          ),
        }} />
      </Tabs>
      <MoreFeaturesModal visible={showMoreModal} onClose={() => setShowMoreModal(false)} />
      </>
  );
}
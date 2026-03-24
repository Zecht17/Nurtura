
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from "react-native";


type Props = {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};


const EmergencyAlert = ({ onPress, style }: Props) => {
  const router = useRouter();
  const handlePress = () => {
    if (onPress) onPress();
    router.push('/emergencyAlertPage');
  };
  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.5 : 1 }, style]}
    >
      <Text style={styles.title}>Emergency Alert</Text>
      <FontAwesome name="exclamation-triangle" size={34} color="white" />
    </Pressable>
  );
};

export default EmergencyAlert;

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: 15,
    width: "100%",
    backgroundColor: "#C10007",
    borderRadius: 24,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 8,
    borderColor: "#ff4d4d",
  },
  title: {
    fontSize: 24,
    color: "#ffffff",
    fontWeight: "bold",
    // marginTop: 10,
  },
})
import { StyleSheet, Text, View } from "react-native";

export default function HighPriorityStatus() {
  return (
    <View style={styles.urgency}>
      <Text style={styles.highPriorityText}>High Priority</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  urgency: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  highPriorityText: {
    color: "#ffffff",
    fontSize: 14,
  },
});

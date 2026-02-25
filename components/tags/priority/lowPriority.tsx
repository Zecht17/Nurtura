import { StyleSheet, Text, View } from "react-native";

export default function LowPriorityStatus() {
  return (
    <View style={styles.priority}>
      <Text style={styles.text}>Low Priority</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  priority: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  text: {
    color: "#111827",
    fontSize: 14,
  },
});

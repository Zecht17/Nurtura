import { StyleSheet, Text, View } from "react-native";

export default function MediumPriorityStatus() {
  return (
    <View style={styles.priority}>
      <Text style={styles.text} allowFontScaling={false}>Medium Priority</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  priority: {
    backgroundColor: "#f59e0b",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  text: {
    color: "#ffffff",
    fontSize: 12,
    flexShrink: 1,
  },
});

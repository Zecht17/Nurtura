import AntDesign from "@expo/vector-icons/AntDesign";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function AddTaskButton() {
  return (
    <Link href="/addTaskPage">
        <LinearGradient
              colors={["#7C6FDC", "rgb(137, 94, 170)"]}
              start={{ x: 0.3706, y: 0.0171 }}
              end={{ x: 0.6294, y: 1 }}
              style={styles.addButton}
            >
      <View style={styles.addButton}>
        <AntDesign name="plus" size={18} color="white" />
        <Text style={styles.addText}>Add Task</Text>
      </View>
      </LinearGradient>
    </Link>
  );
}

const styles = StyleSheet.create({
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: 120,
    height: 35,
    borderRadius: 16,
  },
  addText: {
    color: "white",
    marginLeft: 8,
    fontSize: 18,
  },
});

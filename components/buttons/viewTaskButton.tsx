import AntDesign from "@expo/vector-icons/AntDesign";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function ViewTaskButton() {
  return (
    <Link href="(tabs)/tasks">
        <LinearGradient
              colors={["#f0edf3", "rgb(239, 235, 241)"]}
              start={{ x: 0.3706, y: 0.0171 }}
              end={{ x: 0.6294, y: 1 }}
              style={styles.addButton}
            >
      <View style={styles.addButton}>
        {/* <AntDesign name="plus" size={18} color="white" /> */}
        <Text style={styles.addText}>View Task</Text>
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
    width: 80,
    height: 30,
    borderRadius: 16,
  },
  addText: {
    color: "black",
    // marginLeft: 8,
    fontSize: 15,
  },
});

import AntDesign from "@expo/vector-icons/AntDesign";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

type EditTaskButtonProps = {
  onPress?: () => void;
};

export default function EditTaskButton({ onPress }: EditTaskButtonProps) {
  // If a handler is provided (like EditableTaskCard's edit), use it; otherwise fall back to link
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={{ borderRadius: 16 }}>
        <LinearGradient
          colors={["#7C6FDC", "rgb(137, 94, 170)"]}
          start={{ x: 0.3706, y: 0.0171 }}
          end={{ x: 0.6294, y: 1 }}
          style={styles.addButton}
        >
          <View style={styles.addButton}>
            <AntDesign name="edit" size={18} color="white" />
            <Text style={styles.addText}>Edit</Text>
          </View>
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Link href="/editTaskPage">
      <LinearGradient
        colors={["#7C6FDC", "rgb(137, 94, 170)"]}
        start={{ x: 0.3706, y: 0.0171 }}
        end={{ x: 0.6294, y: 1 }}
        style={styles.addButton}
      >
        <View style={styles.addButton}>
          <AntDesign name="edit" size={18} color="white" />
          <Text style={styles.addText}>Edit</Text>
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
    height: 35,
    borderRadius: 16,
  },
  addText: {
    color: "white",
    marginLeft: 8,
    fontSize: 18,
  },
});

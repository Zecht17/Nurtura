import AntDesign from "@expo/vector-icons/AntDesign";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

type Props = {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function AddDependentsButton({ onPress, style }: Props) {
  return (
    <Link href="/addDependent" asChild>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.addButton,
          { opacity: pressed ? 0.5 : 1 },
          style,
        ]}
      >
        <LinearGradient
          colors={["#7C6FDC", "rgb(137, 94, 170)"]}
          start={{ x: 0.3706, y: 0.0171 }}
          end={{ x: 0.6294, y: 1 }}
          style={styles.addButton}
        >
          <View style={styles.addButton}>
            <AntDesign name="plus" size={14} color="white" />
            <Text style={styles.addText}>Add Dependent</Text>
          </View>
        </LinearGradient>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: 145,
    height: 35,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  addText: {
    color: "white",
    marginLeft: 8,
    fontSize: 14,
  },
});

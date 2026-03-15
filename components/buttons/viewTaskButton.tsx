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

export default function ViewTaskButton({ onPress, style }: Props) {
  return (
    <Link href="/(tabs)/tasks" asChild>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.addButton,
          { opacity: pressed ? 0.5 : 1 },
          style,
        ]}
      >
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
      </Pressable>
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

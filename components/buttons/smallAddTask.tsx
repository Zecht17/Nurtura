import { getResponsiveTokens, scaleByWidth } from "@/utils/responsive";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  ViewStyle,
} from "react-native";

type Props = {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function SmallAddTaskButton({ onPress, style }: Props) {
  const { width } = useWindowDimensions();
  const tokens = getResponsiveTokens(width);
  const minWidth = scaleByWidth(width, 106, 92, 126);

  return (
    <Link href="/addTaskPage" asChild>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.addButton,
          { minWidth },
          { opacity: pressed ? 0.5 : 1 },
          style,
        ]}
      >
        <LinearGradient
          colors={["#7C6FDC", "rgb(137, 94, 170)"]}
          start={{ x: 0.3706, y: 0.0171 }}
          end={{ x: 0.6294, y: 1 }}
          style={[styles.addButton, { minWidth }]}
        >
          <View style={[styles.addButton, { minWidth }] }>
            {/* <AntDesign name="plus" size={18} color="white" /> */}
            <Text style={[styles.addText, { fontSize: tokens.menuText }]} numberOfLines={1}>Add Task</Text>
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
    minWidth: 80,
    paddingHorizontal: 10,
    height: 30,
    borderRadius: 16,
  },
  addText: {
    color: "white",
    // marginLeft: 8,
    fontSize: 15,
  },
});

import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";

export default function CareScreen() {
    return (
        <LinearGradient colors={["#E3F2FD", "#F3E5F8", "#E8E4F8"]}>
        <View>
            <Text>Care Screen</Text>
        </View>
        </LinearGradient>
    );
}
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    Pressable,
    StyleProp,
    StyleSheet,
    Text,
    ViewStyle,
} from "react-native";

type Props = {
	onPress?: () => void;
	style?: StyleProp<ViewStyle>;
};

export default function AiAssistantButton({ onPress, style }: Props) {
	const router = useRouter();

	return (
		<Pressable
			onPress={() => {
				router.push("/aiChat");
				onPress?.();
			}}
			style={({ pressed }) => [
				styles.card,
				{ opacity: pressed ? 0.5 : 1 },
				style,
			]}
		>
			<Ionicons name="sparkles-outline" size={22} color="#7C6FDC" />
			<Text style={styles.text}>AI Assistant</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	card: {
		flex: 1,
		flexDirection: "column",
		width: "50%",
		backgroundColor: "#ffffff",
		borderRadius: 16,
		padding: 20,
		alignItems: "center",
		justifyContent: "center",
	},
	text: {
		fontSize: 16,
		color: "#666",
		marginTop: 5,
	},
});

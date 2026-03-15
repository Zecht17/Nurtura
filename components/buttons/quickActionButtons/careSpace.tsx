import Entypo from "@expo/vector-icons/Entypo";
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

export default function CareSpaceButton({ onPress, style }: Props) {
	return (
		<Pressable
			onPress={onPress}
			style={({ pressed }) => [styles.card, { opacity: pressed ? 0.5 : 1 }, style]}
		>
			<Entypo name="text-document" size={24} color="#7C6FDC" />
			<Text style={styles.text}>Care Spaces</Text>
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

import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

export default function AiAssistantButton() {
	return (
		<View style={styles.card}>
			<Ionicons name="sparkles-outline" size={22} color="#7C6FDC" />
			<Text style={styles.text}>AI Assistant</Text>
		</View>
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

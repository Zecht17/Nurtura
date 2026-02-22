import Entypo from "@expo/vector-icons/Entypo";
import { StyleSheet, Text, View } from "react-native";

export default function CareSpaceButton() {
	return (
		<View style={styles.card}>
			<Entypo name="text-document" size={24} color="#7C6FDC" />
			<Text style={styles.text}>Care Spaces</Text>
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

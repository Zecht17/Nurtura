import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text } from "react-native";

export default function DateStatus() {
	return (
		<LinearGradient
			colors={["#e0e0e0", "#cecdcd"]}
			start={{ x: 0.3706, y: 0.0171 }}
			end={{ x: 0.6294, y: 0.932 }}
			style={styles.date}
		>
			<Text style={styles.dateText}>Feb 8, 2026 Sunday 8:00 am</Text>
		</LinearGradient>
	);
}

const styles = StyleSheet.create({
	date: {
		backgroundColor: "#f1f1f1",
		paddingHorizontal: 12,
		paddingVertical: 4,
		borderRadius: 12,
	},
	dateText: {
		color: "#000000",
		fontSize: 14,
	},
});

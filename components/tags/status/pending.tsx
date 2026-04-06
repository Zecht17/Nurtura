import { StyleSheet, Text, View } from "react-native";

export default function PendingStatus() {
	return (
		<View style={styles.pending}>
			<Text style={styles.pendingText} allowFontScaling={false}>Pending</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	pending: {
		backgroundColor: "#FBBF24",
		paddingHorizontal: 12,
		paddingVertical: 4,
		borderRadius: 12,
	},
	pendingText: {
		color: "#ffffff",
		fontSize: 12,
		flexShrink: 1,
	},
});

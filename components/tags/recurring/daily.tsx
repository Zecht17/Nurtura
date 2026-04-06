import { StyleSheet, Text, View } from "react-native";

export default function DailyRecurringStatus() {
	return (
		<View style={styles.recurring}>
			<Text style={styles.dailyText} allowFontScaling={false}>Daily</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	recurring: {
		backgroundColor: "#3B82F6",
		paddingHorizontal: 12,
		paddingVertical: 4,
		borderRadius: 12,
	},
	dailyText: {
		color: "#ffffff",
		fontSize: 12,
		flexShrink: 1,
	},
});

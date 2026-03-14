import { StyleSheet, Text, View } from "react-native";

export default function ElderlyTypeTag() {
	return (
		<View style={styles.type}>
			<Text style={styles.typeText}>Elderly</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	type: {
		backgroundColor: "#7C6FDC",
        width: 65,
		paddingHorizontal: 12,
		paddingVertical: 4,
		borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
	},
	typeText: {
		color: "#ffffff",
		fontSize: 14,
	},
});

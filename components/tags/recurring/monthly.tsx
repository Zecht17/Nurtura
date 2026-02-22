import { StyleSheet, Text, View } from "react-native";

export default function MonthlyRecurringStatus() {
    return (
        <View style={styles.recurring}>
            <Text style={styles.monthlyText}>Monthly</Text>
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
    monthlyText: {
        color: "#ffffff",
        fontSize: 14,
    },
});

import { StyleSheet, Text, View } from "react-native";

export default function WeeklyRecurringStatus() {
    return (
        <View style={styles.recurring}>
            <Text style={styles.weeklyText}>Weekly</Text>
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
    weeklyText: {
        color: "#ffffff",
        fontSize: 14,
    },
});

import { StyleSheet, Text, View } from "react-native";

export default function CompletedStatus() {
    return (
        <View style={styles.completed}>
            <Text style={styles.completedText} allowFontScaling={false}>Completed</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    completed: {
        backgroundColor: "#CDFACA",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    completedText: {
        color: "#3AC430",
        fontSize: 12,
        flexShrink: 1,
    },
});
